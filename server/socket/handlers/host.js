const assignRoles = require('../../game/assignRoles');
const { resetGameState } = require('../../state/gameState');
const { getLobby } = require('../../state/lobbies');

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
const hostHandler = (io, socket) => {
  socket.on('host-send', (command) => {
    const lobby = getLobby(socket.lobbyId)
    if (!lobby) return;
    const { gameState, countdownTimer } = lobby;

    if (socket.id !== gameState.host?.player_id) {
      socket.emit('host-error', 'Only the host can send commands.');
      return;
    }

    if (command === 'start') {
      assignRoles(gameState);
      gameState.gameStatus = 'playing';
      io.to(socket.lobbyId).emit('gameState-feed', gameState);
      countdownTimer.start();
      io.to(socket.lobbyId).emit('gameStatus-feed', 'playing');

    } else if (command === 'pause') {
      countdownTimer.stop();
      gameState.gameStatus = 'paused';
      io.to(socket.lobbyId).emit('gameStatus-feed', 'paused');

    } else if (command === 'resume') {
      gameState.gameStatus = 'playing';
      io.to(socket.lobbyId).emit('gameStatus-feed', 'playing');
      countdownTimer.start();

    } else if (command === 'setup') {
      // New game: keep only players still connected to the room, drop anyone
      // who left mid-game (their socket is no longer in the room).
      const room = io.sockets.adapter.rooms.get(socket.lobbyId)
      const connectedPlayers = gameState.playerInfo.filter(
        (p) => room && room.has(p.player_id)
      );
      resetGameState(gameState, {
        playerInfo: connectedPlayers,
        gameStatus: 'setup',
        host: gameState.host,
      });
      gameState.playerInfo.forEach((player) => {
        player.role = 0;
        io.to(player.player_id).emit('playerState-feed', player);
      });
      io.to(socket.lobbyId).emit('gameState-feed', gameState);
      io.to(gameState.host.player_id).emit('New Game Plus', true);

    } else if (typeof command === 'object' && command !== null) {
      const { numPlayers, numWolves, timer, seer, healer } = command;
      if (
        typeof numWolves !== 'number' || numWolves < 1 ||
        typeof timer !== 'number' || timer < 10 ||
        typeof seer !== 'boolean' ||
        typeof healer !== 'boolean'
      ) {
        socket.emit('host-error', 'Invalid game configuration.');
        return;
      }
      gameState.timer = timer;
      gameState.initTimer = timer;
      gameState.wolves.number = numWolves;
      gameState.expectedPlayers = numPlayers;
      gameState.isSeer = seer;
      gameState.isHealer = healer;
      io.to(socket.lobbyId).emit('gameState-feed', gameState);
    }
  });
};

module.exports = hostHandler;