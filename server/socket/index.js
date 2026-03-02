const loginHandler     = require('./handlers/login');
const hostHandler      = require('./handlers/host');
const voteHandler      = require('./handlers/votes');
const chatHandlers     = require('./handlers/chat');
const disconnectHandler = require('./handlers/disconnect');

/**
 * Registers all socket event handlers on the io instance.
 * Call once after creating the Socket.io server.
 */
const registerSocketHandlers = (io, gameState, countdownTimer) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    loginHandler(io, socket, gameState);
    hostHandler(io, socket, gameState, countdownTimer);
    voteHandler(io, socket, gameState, countdownTimer);
    chatHandlers(io, socket);
    disconnectHandler(socket, gameState);
  });
};

module.exports = registerSocketHandlers;