import React, { useState, useEffect } from 'react';
import { Modal, Button, ButtonGroup, ToggleButton } from 'react-bootstrap';
import werewolf from '../../public/images/werewolf.svg';
import werewolfTitle from '../../public/images/werewolf-title.svg';
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
import Carousel from 'react-bootstrap/Carousel';

const pictures = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20];

const Login = ({ socket }) => {
  const [show, setShow] = useState(true);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [picture, setPicture] = useState('s1');
  const [header, setHeader] = useState('');

  useEffect(() => {
    socket?.on('login-failed', (responseString) => {
      setHeader(responseString);
    });
    socket?.on('login-success', () => {
      setShow(false);
    });
  }, [socket]);

  const resetForm = () => {
    setUserName('');
    setPassword('');
    setConfirmPassword('');
    setPicture('s1');
    setHeader('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = () => {
    if (!userName || !password) {
      setHeader('Please enter a username and password.');
      return;
    }
    if (mode === 'register') {
      if (password.length < 8) {
        setHeader('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setHeader('Passwords do not match.');
        return;
      }
      socket.emit('register', { username: userName, password, confirmPassword, picture });
    } else {
      socket.emit('login', { username: userName, password, picture });
    }
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        enforceFocus={true}
        style={{ backgroundColor: 'rgba(26, 15, 60, 1) !important' }}
      >
        <Modal.Header closeButton={false} style={{ justifyContent: 'space-around' }}>
          <Modal.Title>
            <img src={werewolfTitle} style={{ height: '35vh', marginTop: '-175px', marginBottom: '-175px' }} />
          </Modal.Title>
        </Modal.Header>
        <span style={{ alignSelf: 'center' }}>
          <img src={werewolf} style={{ height: '30vh', marginTop: '-35px', marginBottom: '-10px' }} />
        </span>
        <Modal.Body style={{ textAlign: 'center', color: header ? 'rgb(255 22 22)' : 'white' }}>
          {header || (mode === 'login' ? 'Log in to your account' : 'Create a new account')}
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: 'center' }}>
          <div className="inputs">
            <label htmlFor="userInput">Username:&nbsp;</label>
            <input
              value={userName}
              type="text"
              id="userInput"
              required
              onChange={(e) => {
                if (e.target.value.search(/[^a-zA-Z0-9]/g) === -1 && e.target.value.length <= 20) {
                  setUserName(e.target.value);
                }
              }}
              className="inputs"
              style={{ margin: '5px', color: 'black' }}
            />
            <div>
              <label htmlFor="passwordInput">Password:&nbsp;&nbsp;</label>
              <input
                value={password}
                type="password"
                id="passwordInput"
                required
                onChange={(e) => setPassword(e.target.value)}
                style={{ margin: '5px', color: 'black' }}
              />
            </div>
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPasswordInput">Confirm:&nbsp;&nbsp;&nbsp;&nbsp;</label>
                <input
                  value={confirmPassword}
                  type="password"
                  id="confirmPasswordInput"
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ margin: '5px', color: 'black' }}
                />
              </div>
            )}
            <div>
              <br />
              <div className="profile-pic">
                <ButtonGroup>
                  {pictures.map((profile, i) => (
                    <ToggleButton
                      key={i}
                      id={`radio-${i}`}
                      type="radio"
                      variant="outline-danger"
                      name="picture"
                      value={`s${i + 1}`}
                      checked={picture === `s${i + 1}`}
                      onChange={(e) => setPicture(e.target.value)}
                    >
                      <img
                        src={profile}
                        style={{
                          height: '5vh',
                          paddingRight: '3px',
                          backgroundColor: 'white',
                          borderRadius: '1em',
                        }}
                      />
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </div>
              <br />
            </div>
          </div>
          <br />
        </Modal.Footer>
        <Button
          variant="warning"
          onClick={handleSubmit}
          style={{ width: '60%', display: 'block', alignSelf: 'center' }}
        >
          {mode === 'login' ? 'Login' : 'Create Account'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '16px' }}>
          {mode === 'login' ? (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              No account?{' '}
              <span
                onClick={() => switchMode('register')}
                style={{ color: 'rgb(255 22 22)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Create one
              </span>
            </span>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              Have an account?{' '}
              <span
                onClick={() => switchMode('login')}
                style={{ color: 'rgb(255 22 22)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Log in
              </span>
            </span>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Login;
