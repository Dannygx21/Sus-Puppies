/**
 * Registers all chat-related socket event handlers.
 *
 * Channels:
 *   living-chat  – visible to all alive players
 *   ghost-chat   – visible to dead players
 *   wolf-chat    – private channel for werewolves
 */
const chatHandlers = (io, socket) => {
  socket.on('living-chat-send', (message) => io.to(socket.lobbyId).emit('living-chat-feed', message));
  socket.on('ghost-chat-send', (message) => io.to(socket.lobbyId).emit('ghost-chat-feed', message));
  socket.on('wolf-chat-send', (message) => io.to(socket.lobbyId).emit('wolf-chat-feed', message));
};

module.exports = chatHandlers;