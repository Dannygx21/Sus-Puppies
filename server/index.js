require('dotenv').config();
const { DB_URL, DB_DBNAME, DB_USER, DB_PASS } = process.env;

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const axios = require('axios');
// connect to database
const mongoose = require('mongoose');
mongoose.connect(DB_URL, {
  dbName: DB_DBNAME,
  user: DB_USER,
  pass: DB_PASS,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const UserController = require('../db/controllers/User.js');

app.use(express.json());
app.use(express.static(__dirname + '/../public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', async (req, res) => {
  UserController.login(req, res);
});

const gameState = {
  timer: 90,
  initTimer: 90,
  previousResult: 'Welcome to Werewolf',
  currentDay: 0,
  currentPhase: 'day',
  phaseResults: [],
  playerInfo: [],
  gameStatus: 'setup',
  votes: [],
  initWolves: 1,
  isSeer: false,
  isHealer: false,
  wolves: {
    number: 0,
    players: [],
  },
  host: {},
  seerMessage: '',
};
const initGameState = {};
Object.assign(initGameState, gameState);
/**
 * CountDown will decrement the timer property in the reference object and pass the result to the callback including 0.
 * This class has four methods. start, stop, countdown, and newCountDown
 * Only call start, stop, and newCountDown.
 * @param {object} objectReference This should be gameState. Otherwise object must have timer and initTimer properties with int values.
 * @param {function} cb Will be passed the new decremented timer value.
 * Example: timer === 90 -> cb(89). cb will never recieve 90 but will recieve 0
 * cb is not provided then default behavior will return timer value and update object.
 * @return {object} Returns new instance of CountDown.
 */
class CountDown {
  constructor(objectReference = gameState, cb = (time) => time) {
    this.gameState = objectReference;
    this.countDownReference;
    this.cb = cb;
    this.isCounting = false;
    this.countdown = this.countdown.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }
  /**
   * Do not call this function directly. It will create erratic behavior. Use start(), stop(), or newCountDown().
   * @param {boolean} isNewCountDown true will reset and continue countdown. false will generate a new countdown instance
   */
  countdown(isNewCountDown) {
    if (isNewCountDown) {
      this.stop();
      this.gameState.timer = this.gameState.initTimer;
    }
    if (this.gameState.timer > -Infinity) {
      this.isCounting = true;
      this.countDownReference = setTimeout(this.countdown, 1000);
    }
    this.cb(--this.gameState.timer);
  }
  /**
   * Start() does not take any params. Will continue counting down or start new countdown based on object timer/initTimer properties.
   * Will not add an additional timer if called while actively counting down.
   * If you need a new countdown then call newCountDown()
   */
  start() {
    if (gameState.gameStatus === 'setup') {
      let numWolves = gameState.wolves.number;
      while (numWolves > 0) {
        let rando = Math.floor(Math.random() * gameState.playerInfo.length);
        if (gameState.playerInfo[rando].role === 0) {
          gameState.playerInfo[rando].role = 2;
          numWolves--;
        }
      }
      let needSeer = false;
      if (gameState.isSeer) needSeer = true;
      while (needSeer) {
        let rando = Math.floor(Math.random() * gameState.playerInfo.length);
        if (gameState.playerInfo[rando].role === 0) {
          gameState.playerInfo[rando].role = 4;
          needSeer = false;
        }
      }
      let needHealer = false;
      if (gameState.isHealer) needHealer = true;
      while (needHealer) {
        let rando = Math.floor(Math.random() * gameState.playerInfo.length);
        if (gameState.playerInfo[rando].role === 0) {
          gameState.playerInfo[rando].role = 6;
          needHealer = false;
        }
      }
      gameState.gameStatus = 'playing';
      io.emit('gameState-feed', this.gameState);
    }
    if (this.isCounting) return;
    if (this.gameState.timer > 0) {
      this.countdown(false);
    } else {
      this.countdown(true);
    }
  }
  /**
   * Stops and clears countdown instance. Does not take params.
   */
  stop() {
    //TODO
    this.isCounting = false;
    clearTimeout(this.countDownReference);
  }
  /**
   * Creates a new countdown. Does not take any params
   * It will reset current countdown. This does not stop the countdown. Call stop() first before calling newCountDown().
   */
  newCountDown() {
    this.stop();
    this.gameState.timer = this.gameState.initTimer;
    this.start();
  }
}
const countdownTimer = new CountDown(gameState, (time) => {
  io.emit('timer-feed', time);
});

io.on('connection', (socket) => {
  const socketID = socket.id;
  socket.on('login', ({ username, password, picture }) => {
    //TODO: receive picture
    console.log(`Login attempt: userName ${username} password: ${password}`);
    // TODO: login logic~
    const options = {
      url: '/login',
      method: 'post',
      baseURL: 'http://localhost:3000',
      data: {
        username,
        password,
        socket: socketID,
        picture,
      },
    };
    axios(options)
      .then(({ body, status, data }) => {
        console.log(`status: ${status} ${data}`);
        if (data !== 'Error, Bad Username/Password. Check Password') {
          // PLAYER OBJECT
          const playerState = {
            username,
            player_id: socketID,
            role: 0,
            picture,
          }; //TODO: add picture to playerState
          if (gameState.playerInfo.length === 0) {
            playerState.host = true;
            gameState.host = playerState;
          } else {
            playerState.host = false;
          }
          gameState.playerInfo.push(playerState);
          socket.emit('login-success', body);
          // io.emit('playerInfo-feed', gameState.playerInfo);
          io.to(socketID).emit('playerState-feed', playerState);
          io.emit('gameState-feed', gameState);
        } else {
          socket.emit('login-failed', 'Incorrect password!');
        }
        //TODO: add a route for creating player state
      })
      .catch((e) => {
        console.log('Failed connection: ', e);
        socket.emit('login-failed', 'Failed to reach server!');
      });
  });

  //host logic
  socket.on('host-send', (messageOrObject) => {
    // change server game state based on host command
    if (messageOrObject === 'pause') {
      // send game status to all players (including host)
      countdownTimer.stop();
      gameState.gameStatus = 'paused';
      io.emit('gameStatus-feed', 'paused');
    } else if (messageOrObject === 'resume') {
      gameState.gameStatus = 'playing';
      io.emit('gameStatus-feed', 'playing');
      countdownTimer.start();
    } else if (typeof messageOrObject === 'object') {
      const { numPlayers, numWolves, timer, seer, healer } = messageOrObject;
      gameState.timer = timer;
      gameState.initTimer = timer;
      gameState.wolves.number = numWolves;
      gameState.expectedPlayers = numPlayers;
      gameState.isSeer = seer;
      gameState.isHealer = healer;
      io.emit('gameState-feed', gameState);
    } else if (messageOrObject === 'start') {
      countdownTimer.start();
      io.emit('gameStatus-feed', 'playing');
    } else if (messageOrObject === 'setup') {
      //TODO: setup logic
      //this is when a new game is being created
      const preservedProps = {
        playerInfo: gameState.playerInfo,
        gameStatus: 'setup',
        host: gameState.host,
      };
      Object.assign(gameState, initGameState, preservedProps);
      gameState.playerInfo.forEach((player) => {
        player.role = 0;
        io.to(player.player_id).emit('playerState-feed', player);
      });
      io.emit('gameState-feed', gameState);
      io.to(gameState.host.player_id).emit('New Game Plus', true);
    }

    //rulesSet sender TODO:
    // io.emit('ruleset-feed', object);
  });

  // votes logic
  socket.on('vote-send', (voteTuple) => {
    // Voting logic and changing server game state here
    gameState.votes.push(voteTuple);
    let numWolves = 0;
    let numVillagers = 0;
    let numSpecialists = 0;
    for (let i = 0; i < gameState.playerInfo.length; i++) {
      if (gameState.playerInfo[i].role === 2) {
        numWolves++;
      }
      if (
        gameState.playerInfo[i].role === 4 ||
        gameState.playerInfo[i].role === 6
      ) {
        numSpecialists++;
      }
      if (
        gameState.playerInfo[i].role === 0 ||
        gameState.playerInfo[i].role === 4 ||
        gameState.playerInfo[i].role === 6
      ) {
        numVillagers++;
      }
    }
    let numLiving = numWolves + numVillagers;
    if (gameState.currentPhase === 'day') {
      if (gameState.votes.length === numLiving) {
        phaseChange(countdownTimer);
        let returnObj = {
          timer: gameState.timer,
          previousResult: gameState.previousResult,
          currentDay: gameState.currentDay,
          currentPhase: gameState.currentPhase,
          phaseResults: gameState.phaseResults,
          playerInfo: gameState.playerInfo,
        };
        Object.assign(gameState, returnObj);
        io.emit('gameState-feed', gameState);
      }
    } else {
      if (gameState.votes.length === numWolves + numSpecialists) {
        phaseChange(countdownTimer);
        let returnObj = {
          timer: gameState.timer,
          previousResult: gameState.previousResult,
          currentDay: gameState.currentDay,
          currentPhase: gameState.currentPhase,
          phaseResults: gameState.phaseResults,
          playerInfo: gameState.playerInfo,
        };

        Object.assign(gameState, returnObj);
        io.emit('gameState-feed', gameState);
      }
    }
  });

  // living chat logic
  socket.on('living-chat-send', (message) => {
    io.emit('living-chat-feed', message);
  });

  // ghost chat logic
  socket.on('ghost-chat-send', (message) => {
    io.emit('ghost-chat-feed', message);
  });

  // wolf chat logic
  socket.on('wolf-chat-send', (message) => {
    io.emit('wolf-chat-feed', message);
  });

  socket.on('disconnect', (reason) => {
    console.log(`user ${socket.id} disconnected`);
    if (gameState.playerInfo.length !== 0) {
      if (gameState.playerInfo[0].player_id === socket.id) {
        if (gameState.playerInfo.length > 1) {
          gameState.playerInfo[1].host = true;
          gameState.playerInfo.shift();
          console.log(
            `Host disconnected, ${gameState.playerInfo[0].username} is the new host`
          );
        }
      }
    }
  });
});

// instrument(io, { auth: false });
// how to use socket.io admin ui. ::::
// start up servers in terminal
// go to "admin.socket.io"  in browser
// clear path option in browser and toggle websocket only option on

const phaseChange = (countdownTimer) => {
  //Phase Change
  //0. Build Variables
  let numWolves = 0;
  let numVillagers = 0;
  let numSpecialists = 0;
  for (let i = 0; i < gameState.playerInfo.length; i++) {
    if (gameState.playerInfo[i].role === 2) {
      numWolves++;
    }
    if (
      gameState.playerInfo[i].role === 4 ||
      gameState.playerInfo[i].role === 6
    ) {
      numSpecialists++;
    }
    if (
      gameState.playerInfo[i].role === 0 ||
      gameState.playerInfo[i].role === 4 ||
      gameState.playerInfo[i].role === 6
    ) {
      numVillagers++;
    }
  }
  let numLiving = numWolves + numVillagers;
  //1. Tally Votes
  if (gameState.currentPhase === 'day') {
    let votes = {};
    //Villager Vote Logic
    for (let i = 0; i < gameState.votes.length; i++) {
      if (votes[gameState.votes[i][1]]) {
        votes[gameState.votes[i][1]]++;
      } else {
        votes[gameState.votes[i][1]] = 1;
      }
    }
    let voteKeys = Object.keys(votes);
    let maxVotes = -1;
    let victim = '';
    let majority = Math.round(numLiving / 2);
    for (let i = 0; i < voteKeys.length; i++) {
      if (votes[voteKeys[i]] > maxVotes) {
        victim = voteKeys[i];
        maxVotes = votes[voteKeys[i]];
      }
    }
    if (maxVotes >= majority && victim !== 'NULL') {
      //Hang Victim Wolf
      // for loop to look at all players
      for (let i = 0; i < gameState.playerInfo.length; i++) {
        // if the current player is the player killed 
        if (gameState.playerInfo[i].username === victim) {
          // if the player is a wolf
          if (gameState.playerInfo[i].role === 2) {
            // change player role to 3 = dead wolf?
            gameState.playerInfo[i].role = 3;
            numWolves--;
            gameState.phaseResults.push([
              gameState.currentDay,
              gameState.currentPhase,
              victim,
            ]);
          } else {
            //Hang Other Victim
            // change role to same role but dead
            // if role 0 (alive villager) -> 1 (dead vilager)
            // if role 4 (alive seer) -> 5 (dead seer)
            // if role 6 (alive healer) -> 7 (dead healer)
            gameState.playerInfo[i].role += 1;
            numVillagers--;
            gameState.phaseResults.push([
              gameState.currentDay,
              gameState.currentPhase,
              victim,
            ]);
          }
          gameState.previousResult = victim + ' was killed yesterday!';
        }
      }
      //if no majority of votes met, no victim (no role change for all player)
    } else {
      victim = 'No one';
      gameState.phaseResults.push([
        gameState.currentDay,
        gameState.currentPhase,
        victim,
      ]);
      gameState.previousResult = 'No one was killed yesterday.';
    }
  } else {
    //Wolf Vote Logic
    // used at night phase only for wolves to vote on who to kill
    // also used for seer to view player role at night
    // also used for healer to heal player at night
    let votes = {};
    let seerTarget = '';
    let healerTarget = '';
    for (let i = 0; i < gameState.votes.length; i++) {
      let player = gameState.playerInfo.find(
        (player) => player.username === gameState.votes[i][0]
      );
      // seer role logic at night phase
      if (player.role === 4) {
        seerTarget = gameState.votes[i][1];
        if (seerTarget !== 'NULL' || seerTarget !== 'select a player') {
          let seerTargetPlayerInfo = gameState.playerInfo.find(
            (player) => player.username === seerTarget
          );
          const roleDefinitions = [
            'Villager',
            'Dead Villager',
            'Werewolf',
            'Dead Werewolf',
            'Seer',
            'Dead Seer',
            'Healer',
            'Dead Healer',
          ];
          gameState.seerMessage =
            seerTarget +
            ' is actually a ' +
            roleDefinitions[seerTargetPlayerInfo.role];
        }
        // healer role logic at night phase
      } else if (player.role === 6) {
        healerTarget = gameState.votes[i][1];
      } else if (votes[gameState.votes[i][1]]) {
        votes[gameState.votes[i][1]]++;
      } else {
        votes[gameState.votes[i][1]] = 1;
      }
    }
    let voteKeys = Object.keys(votes);
    let maxVotes = -1;
    let victim = '';
    for (let i = 0; i < voteKeys.length; i++) {
      if (votes[voteKeys[i]] > maxVotes) {
        victim = voteKeys[i];
        maxVotes = votes[voteKeys[i]];
      } else if (votes[voteKeys[i]] === maxVotes) {
        let coinFlip = Math.floor(Math.random() * 2) == 0;
        if (coinFlip) {
          victim = voteKeys[i];
        }
      }
    }
    if (maxVotes === -1 || victim === 'NULL') {
      //TODO: choose a living non-wolf at random to kill
      while (victim === '' || victim === 'NULL') {
        let rando = Math.floor(Math.random() * gameState.playerInfo.length);
        if (
          gameState.playerInfo[rando].role === 0 ||
          gameState.playerInfo[rando].role === 4 ||
          gameState.playerInfo[rando].role === 6
        ) {
          victim = gameState.playerInfo[rando].username;
        }
      }
    }
    if (victim !== healerTarget) {
      for (let i = 0; i < gameState.playerInfo.length; i++) {
        if (gameState.playerInfo[i].username === victim) {
          if (
            gameState.playerInfo[i].role === 4 ||
            gameState.playerInfo[i] === 6
          ) {
            numSpecialists--;
          }
          gameState.playerInfo[i].role += 1;
          numVillagers--;
          gameState.phaseResults.push([
            gameState.currentDay,
            gameState.currentPhase,
            victim,
          ]);
          gameState.previousResult = victim + ' was eaten last night!';
        }
      }
    } else {
      victim = 'No one';
      gameState.phaseResults.push([
        gameState.currentDay,
        gameState.currentPhase,
        victim,
      ]);
      gameState.previousResult = victim + ' was eaten last night!';
    }
  }
  //2. Check if game has ended
  if (numWolves === 0) {
    gameState.previousResult = 'Villagers Win!';
    let returnObj = {
      timer: gameState.timer,
      previousResult: gameState.previousResult,
      currentDay: gameState.currentDay,
      currentPhase: gameState.currentPhase,
      phaseResults: gameState.phaseResults,
      playerInfo: gameState.playerInfo,
      gameStatus: 'ended',
    };
    Object.assign(gameState, returnObj);
    io.emit('gameState-feed', gameState);
    countdownTimer.stop();
    console.log('Villagers win');
  } else if (numWolves >= numVillagers) {
    gameState.previousResult = 'Wolves Win!';
    let returnObj = {
      timer: gameState.timer,
      previousResult: gameState.previousResult,
      currentDay: gameState.currentDay,
      currentPhase: gameState.currentPhase,
      phaseResults: gameState.phaseResults,
      playerInfo: gameState.playerInfo,
      gameStatus: 'ended',
      seerMessage: gameState.seerMessage,
    };
    Object.assign(gameState, returnObj);
    io.emit('gameState-feed', gameState);
    countdownTimer.stop();
    console.log('Wolves Win');
  }
  //3. Game Continues
  else if (gameState.currentPhase === 'day') {
    gameState.currentPhase = 'night';
    gameState.votes = [];
    // gameState.timer = gameState.initTimer;
    countdownTimer.newCountDown();
    io.emit('gameState-feed', gameState);
  } else {
    gameState.currentPhase = 'day';
    gameState.currentDay++;
    gameState.votes = [];
    // gameState.timer = gameState.initTimer;
    countdownTimer.newCountDown();
    io.emit('gameState-feed', gameState);
  }
};

server.listen(3000, () => {
  console.log(`Werewolf listening on port 3000`);
});
