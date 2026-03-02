const { login } = require('../../db/controllers/UserController');
const { getLobby } = require('../../state/lobbies')

/**
 * Handles the 'login' socket event.
 * Calls the DB directly (no internal HTTP round-trip).
 * On success, adds the player to gameState and broadcasts updated state.
 */
const loginHandler = (io, socket) => {

  socket.on('login', async ({ username, password, picture }) => {
    const lobby = getLobby(socket.lobbyId)
    if (!lobby) {
      socket.emit('login-failed', 'You are not in a lobby.')
      return
    }

    const { gameState } = lobby
    console.log(`Login attempt: ${username}`);

    const user = await login(username, password, socket.id);

    if (!user) {
      socket.emit('login-failed', 'Failed to reach server!');
      return;
    }

    const playerState = {
      username,
      player_id: socket.id,
      role: 0,
      picture,
      host: gameState.playerInfo.length === 0,
    };

    if (playerState.host) {
      gameState.host = playerState;
    }

    gameState.playerInfo.push(playerState);

    socket.emit('login-success', user);
    io.to(socket.id).emit('playerState-feed', playerState);
    io.to(socket.lobbyId).emit('gameState-feed', gameState)
  });
};

module.exports = loginHandler;