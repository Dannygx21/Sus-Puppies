const lobbyHandler = require('./handlers/lobby')
const loginHandler = require('./handlers/login');
const hostHandler = require('./handlers/host');
const voteHandler = require('./handlers/votes');
const chatHandlers = require('./handlers/chat');
const disconnectHandler = require('./handlers/disconnect');

/**
 * Registers all socket event handlers on the io instance.
 * Call once after creating the Socket.io server.
 */
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    lobbyHandler(io, socket)
    loginHandler(io, socket);
    hostHandler(io, socket);
    voteHandler(io, socket);
    chatHandlers(io, socket);
    disconnectHandler(io, socket);
  });
};

module.exports = registerSocketHandlers;