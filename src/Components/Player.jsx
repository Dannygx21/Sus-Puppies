import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GiSquare, GiCheckMark, GiHelp, GiWolfHowl, GiHeartPlus, GiBleedingEye } from 'react-icons/gi';
import s1 from '../../public/images/1.svg';
import s2 from '../../public/images/2.svg';
import s3 from '../../public/images/3.svg';
import s4 from '../../public/images/4.svg';
import s5 from '../../public/images/5.svg';
import s6 from '../../public/images/6.svg';
import s7 from '../../public/images/7.svg';
import s8 from '../../public/images/8.svg';
import s9 from '../../public/images/9.svg';
import s10 from '../../public/images/10.svg';
import s11 from '../../public/images/11.svg';
import s12 from '../../public/images/12.svg';
import s13 from '../../public/images/13.svg';
import s14 from '../../public/images/14.svg';
import s15 from '../../public/images/15.svg';
import s16 from '../../public/images/16.svg';
import s17 from '../../public/images/17.svg';
import s18 from '../../public/images/18.svg';
import s19 from '../../public/images/19.svg';
import s20 from '../../public/images/20.svg';

const pictures = {
  s1: s1,
  s2: s2,
  s3: s3,
  s4: s4,
  s5: s5,
  s6: s6,
  s7: s7,
  s8: s8,
  s9: s9,
  s10: s10,
  s11: s11,
  s12: s12,
  s13: s13,
  s14: s14,
  s15: s15,
  s16: s16,
  s17: s17,
  s18: s18,
  s19: s19,
  s20: s20,
}

const Player = ({ player, currentPhase, playerInfo}) => {
  const icons = [
    <GiSquare size={25} style={{ marginLeft: "-25px", zIndex: "-1", paddingBottom: "5px" }} />,
    <GiCheckMark size={25} style={{ marginLeft: "-25px", zIndex: "-1", paddingBottom: "5px" }} />,
    <GiHelp size={25} style={{ marginLeft: "-25px", zIndex: "-1", paddingBottom: "5px" }} />,
    <GiWolfHowl size={25} style={{ marginLeft: "-25px", zIndex: "-1", paddingBottom: "5px" }} />,
    <GiHeartPlus size={25} style={{ marginLeft: "-25px", zIndex: "-1", paddingBottom: "5px" }} />,
    <GiBleedingEye size={25} style={{ marginLeft: "-25px", zIndex: "-1", paddingBottom: "5px" }} />
  ];

  const [index, setIndex] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(icons[index]);

  const handleClick = () => {
    index === icons.length - 2 ? setIndex(-1) : setIndex(index + 1);
    setCurrentIcon(icons[index + 1]);
  }

  useEffect(() => {
    setIndex(0)
    setCurrentIcon(icons[index]);
  }, [currentPhase])

  return (
    <div className="item2">
      {player === undefined
        ? (<span onClick={handleClick}>
          {currentIcon}
          &nbsp;Player Name
        </span>)
        : (<span onClick={handleClick}>
          {currentIcon}
          &nbsp;{player.username}
        </span>)
      }
      <div>
      {player.role % 2 === 1
        ? (<img src={pictures[player.picture]} style={{ height: "7vh", backgroundColor: "red", borderRadius: '1em', opacity: 0.5 }} />)
        : (<img src={pictures[player.picture]} style={{ height: "7vh", backgroundColor: "white", borderRadius: '1em' }} />)
      }
      </div>
    </div>
  )
}

export default Player;
