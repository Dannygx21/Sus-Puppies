import React, { useState, useEffect } from 'react';
// import Styled from 'styled-components';
import { Button } from 'react-bootstrap';
// import DropdownButton from 'react-bootstrap/DropdownButton';
import Select from 'react-select';

const Voting = ({
  timer,
  currentPhase,
  playerInfo,
  playerState,
  socket,
  gameStatus,
}) => {
  const [voteSelection, setVoteSelection] = useState('select a player');
  const [nightVoteSelection, setNightVoteSelection] = useState('select a player');
  const [isVoted, setIsVoted] = useState(false);
  const [villagerOptions, setVillagerOptions] = useState([]);
  const [healerOptions, setHealerOptions] = useState([]);
  const [wolfOptions, setWolfOptions] = useState([]);

  const logChange = (e) => {
    if (currentPhase === 'day' || currentPhase === 'Day') {
      setVoteSelection(e.value);
    } else if (currentPhase === 'night' || currentPhase === 'Night') {
      setNightVoteSelection(e.value);
    }
  };

  useEffect(() => {
    if (isVoted) {
      setIsVoted(false);
    }
    const villagers = playerInfo
      .filter((player) => player.player_id !== playerState.player_id)
      .filter((player) => player.role % 2 === 0)
      .map((player, idx) => {
        return { value: player.username, label: player.username };
      });

    const villagersWithSelf = playerInfo
      .filter((player) => player.role % 2 === 0)
      .map((player, idx) => {
        return { value: player.username, label: player.username };
      });

    const wolves = playerInfo
      .filter((player) => player.player_id !== playerState.player_id)
      .filter((player) => player.role % 2 === 0 && player.role !== 2)
      .map((player, idx) => {
        return { value: player.username, label: player.username };
      });
    setVillagerOptions(villagers);
    setHealerOptions(villagersWithSelf);
    setWolfOptions(wolves);
    setVoteSelection('select a player');
    setNightVoteSelection('select a player');
  }, [currentPhase, gameStatus]);

  const submitVote = (e) => {
    if (!isVoted && (currentPhase === 'day' || currentPhase === 'Day')) {
      const target = voteSelection === 'select a player' ? 'NULL' : voteSelection;
      socket?.emit('vote-send', [playerState.username, target]);
      setIsVoted(true);
      setVillagerOptions([]);
      setWolfOptions([]);
      setVoteSelection('select a player');
    } else if (!isVoted && (currentPhase === 'night' || currentPhase === 'Night')) {
      const target = nightVoteSelection === 'select a player' ? 'NULL' : nightVoteSelection;
      socket?.emit('vote-send', [playerState.username, target]);
      setIsVoted(true);
      setVillagerOptions([]);
      setWolfOptions([]);
      setNightVoteSelection('select a player');
    }
  };

  useEffect(() => {
    if (timer === 0 && gameStatus !== 'setup' && !isVoted) {
      submitVote();
    }
    //TODO: add lifecycle method to watch for cuurentPhase change
    //setIsVoted -> false
  }, [timer]);

  const player =
    playerInfo
      ?.find(player => player?.player_id === playerState?.player_id || null)

  if (currentPhase === 'night' && player?.role === 2) {
    return (
      <>
        <h3>Wolves Vote!</h3>
        <Select
          className='dropdown'
          onChange={logChange}
          options={wolfOptions}
          placeholder={nightVoteSelection}
        />
        <div className='game-button'>
          <Button variant='warning' onClick={submitVote}>
            Kill Villager
          </Button>
        </div>
      </>
    );
  } else if (currentPhase === 'night' && player?.role === 4) {
    return (
      <>
        <h3>Seer, choose who to investigate</h3>
        <Select
          className='dropdown'
          onChange={logChange}
          options={villagerOptions}
          placeholder={nightVoteSelection}
        />
        <div className='game-button'>
          <Button variant='warning' onClick={submitVote}>
            Discover Role
          </Button>
        </div>
      </>
    )
  } else if (currentPhase === 'night' && player?.role === 6) {
    return (
      <>
        <h3>Healer, choose who to heal</h3>
        <Select
          className='dropdown'
          onChange={logChange}
          options={healerOptions}
          placeholder={nightVoteSelection}
        />
        <div className='game-button'>
          <Button variant='warning' onClick={submitVote}>
            Heal
          </Button>
        </div>
      </>
    )
  } else if (player?.role % 2 === 1) {
    return <div>You're dead. No voting allowed</div>;
  } else if (currentPhase === 'night' && player?.role !== 2) {
    return <div>Sleep peacefully while the werewolves are about...</div>;
  } else {
    return (
      <>
        <h3>Everybody Votes!</h3>
        <Select
          className='dropdown'
          onChange={logChange}
          options={villagerOptions}
          placeholder={voteSelection}
        />
        <div className='game-button'>
          <Button variant='secondary'
            style={{ marginRight: '18px' }}
            onClick={() => {
              submitVote();
            }}
            disabled={isVoted}
          >
            Skip Vote
          </Button>
          <Button variant='warning' onClick={submitVote} disabled={isVoted}>
            Submit
          </Button>
        </div>
      </>
    );
  };
};

export default Voting;
