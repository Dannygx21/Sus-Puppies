import React from 'react';
import werewolf from '../../public/images/werewolf.svg';
import werewolfTitle from '../../public/images/werewolf-title.svg';

const Header = ({ currentPhase, currentDay, previousResult }) => {

  return (
    <div>
      <span style={{ display: 'inline-block' }}>
        <img src={werewolf} style={{ height: "8vh" }} />
      </span>
      <span style={{ display: 'inline-block', marginTop: "-100px" }}>
        <img src={werewolfTitle} style={{ height: "20vh", left: "5%" }} />
      </span>
      <span style={{ position: "absolute", right: "45%", top: "4%", fontSize: "2vh", color: "red", textTransform: "uppercase" }}>{previousResult} </span>
      <span style={{ position: "absolute", right: "5%", top: "4%", fontSize: "2vh", textTransform: "uppercase" }}>{currentPhase} {currentDay}</span>
    </div >
  )
}

export default Header;
