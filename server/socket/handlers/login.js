const { login, createUser } = require('../../db/controllers/UserController');
const { getLobby } = require('../../state/lobbies');
const { sanitizeString, isValidUsername, isValidPassword } = require('../../utils/sanitize');
const { checkRateLimit, recordFailure, clearAttempts } = require('../../utils/rateLimiter');

const addPlayerToLobby = (socket, io, gameState, username, picture) => {
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

  io.to(socket.id).emit('playerState-feed', playerState);
  io.to(socket.lobbyId).emit('gameState-feed', gameState);
};

const validateInputs = (username, password) => {
  const cleanUsername = sanitizeString(username, 20);
  const cleanPassword = sanitizeString(password, 64);

  if (!isValidUsername(cleanUsername)) {
    return { valid: false, reason: 'Username must be 3–20 alphanumeric characters.' };
  }
  if (!isValidPassword(cleanPassword)) {
    return { valid: false, reason: 'Password must be 8–64 characters.' };
  }
  return { valid: true, username: cleanUsername, password: cleanPassword };
};

const loginHandler = (io, socket) => {

  socket.on('login', async ({ username, password, picture }) => {
    const lobby = getLobby(socket.lobbyId);
    if (!lobby) {
      socket.emit('login-failed', 'You are not in a lobby.');
      return;
    }

    const validated = validateInputs(username, password);
    if (!validated.valid) {
      socket.emit('login-failed', validated.reason);
      return;
    }

    const usernameKey = validated.username.toLowerCase();
    const limit = checkRateLimit(usernameKey);
    if (limit.blocked) {
      socket.emit('login-failed', limit.message);
      return;
    }

    console.log(`Login attempt: ${validated.username}`);
    const result = await login(validated.username, validated.password);

    if (!result.success) {
      recordFailure(usernameKey);
      socket.emit('login-failed', result.reason);
      return;
    }

    clearAttempts(usernameKey);
    addPlayerToLobby(socket, io, lobby.gameState, validated.username, picture);
    socket.emit('login-success', result.user);
  });

  socket.on('register', async ({ username, password, confirmPassword, picture }) => {
    const lobby = getLobby(socket.lobbyId);
    if (!lobby) {
      socket.emit('login-failed', 'You are not in a lobby.');
      return;
    }

    const validated = validateInputs(username, password);
    if (!validated.valid) {
      socket.emit('login-failed', validated.reason);
      return;
    }

    const cleanConfirm = sanitizeString(confirmPassword, 64);
    if (validated.password !== cleanConfirm) {
      socket.emit('login-failed', 'Passwords do not match.');
      return;
    }

    const usernameKey = validated.username.toLowerCase();
    const limit = checkRateLimit(usernameKey);
    if (limit.blocked) {
      socket.emit('login-failed', limit.message);
      return;
    }

    console.log(`Register attempt: ${validated.username}`);
    const result = await createUser(validated.username, validated.password, socket.id);

    if (!result.success) {
      recordFailure(usernameKey);
      socket.emit('login-failed', result.reason);
      return;
    }

    clearAttempts(usernameKey);
    addPlayerToLobby(socket, io, lobby.gameState, validated.username, picture);
    socket.emit('login-success', result.user);
  });
};

module.exports = loginHandler;
