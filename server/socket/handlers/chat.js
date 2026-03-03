/**
 * Registers all chat-related socket event handlers.
 *
 * Channels:
 *   living-chat  – visible to all alive players
 *   ghost-chat   – visible to dead players
 *   wolf-chat    – private channel for werewolves
 */
const { sanitizeString } = require('../../utils/sanitize');

const MAX_MSG_LEN = 300;

const broadcast = (io, socket, feedEvent) => (raw) => {
  if (!socket.lobbyId) return;
  const message = sanitizeString(raw, MAX_MSG_LEN);
  if (!message) return;
  io.to(socket.lobbyId).emit(feedEvent, message);
};

const chatHandlers = (io, socket) => {
  socket.on('living-chat-send', broadcast(io, socket, 'living-chat-feed'));
  socket.on('ghost-chat-send',  broadcast(io, socket, 'ghost-chat-feed'));
  socket.on('wolf-chat-send',   broadcast(io, socket, 'wolf-chat-feed'));
};

module.exports = chatHandlers;