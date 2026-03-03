import React from 'react';
import Button from 'react-bootstrap/Button';

const GameButton = ({ playerInfo, playerState, gameStatus, socket }) => {

  const handleClickStart = () => {
    socket?.emit('host-send', 'start')
  }
  const handleClickPause = () => {
    socket?.emit('host-send', 'pause')
  }
  const handleClickResume = () => {
    socket?.emit('host-send', 'resume')
  }
  const handleClickNewGame = () => {
    socket?.emit('host-send', 'setup');
  }
  const playerRole =
  playerInfo
    ?.find(player => player?.player_id === playerState?.player_id || null);

  const {host} = playerState;
  console.log('Current value of host: ', host, `Game status is: ${gameStatus}`);
  return (
    <div className="game-button" >
      {gameStatus === 'setup' && host
        ? <Button
            variant="warning"
            onClick={handleClickStart}
            style={{width:"100%", display:"block"}}
          > Start Game </Button>
        : gameStatus === 'setup' && !host
        ? <Button
            variant="warning"
            style={{width:"100%", display:"block"}}
          > Waiting for host to start the game </Button>
        : gameStatus === 'playing' && host
        ? <Button
            variant="warning"
            onClick={handleClickPause}
            style={{width:"100%", display:"block"}}
          > Pause Game </Button>
        : gameStatus === 'paused' && host
        ? <Button
            variant="warning"
            onClick={handleClickResume}
            style={{width:"100%", display:"block"}}
          > Resume Game </Button>
        : gameStatus === 'ended'
        ? <Button
            variant="warning"
            style={{width:"100%", display:"block"}}
            onClick={handleClickNewGame}
          > Start New Game </Button>
        : <Button
            variant="warning"
            style={{width:"100%", display:"block"}}
          > This button is not for you to click </Button>}
    </div >
  )
}

export default GameButton;

