const assignRoles = require('../../game/assignRoles');
const { resetGameState } = require('../../state/gameState');

/**
 * Handles all 'host-send' socket events.
 *
 * Supported commands (string):
 *   'start'  – assign roles and begin the countdown
 *   'pause'  – stop the timer
 *   'resume' – resume the timer
 *   'setup'  – reset for a new game (preserves connected players)
 *
 * Supported commands (object):
 *   { numPlayers, numWolves, timer, seer, healer } – configure game rules
 */
const hostHandler = (io, socket, gameState, countdownTimer) => {
  socket.on('host-send', (command) => {
    if (command === 'start') {
      assignRoles(gameState);
      gameState.gameStatus = 'playing';
      io.emit('gameState-feed', gameState);
      countdownTimer.start();
      io.emit('gameStatus-feed', 'playing');

    } else if (command === 'pause') {
      countdownTimer.stop();
      gameState.gameStatus = 'paused';
      io.emit('gameStatus-feed', 'paused');

    } else if (command === 'resume') {
      gameState.gameStatus = 'playing';
      io.emit('gameStatus-feed', 'playing');
      countdownTimer.start();

    } else if (command === 'setup') {
      // New game: keep all currently connected players but reset everything else
      resetGameState({
        playerInfo: gameState.playerInfo,
        gameStatus: 'setup',
        host: gameState.host,
      });
      gameState.playerInfo.forEach((player) => {
        player.role = 0;
        io.to(player.player_id).emit('playerState-feed', player);
      });
      io.emit('gameState-feed', gameState);
      io.to(gameState.host.player_id).emit('New Game Plus', true);

    } else if (typeof command === 'object' && command !== null) {
      const { numPlayers, numWolves, timer, seer, healer } = command;
      gameState.timer = timer;
      gameState.initTimer = timer;
      gameState.wolves.number = numWolves;
      gameState.expectedPlayers = numPlayers;
      gameState.isSeer = seer;
      gameState.isHealer = healer;
      io.emit('gameState-feed', gameState);
    }
  });
};

module.exports = hostHandler;