/**
 * Registers all chat-related socket event handlers.
 *
 * Channels:
 *   living-chat  – visible to all alive players
 *   ghost-chat   – visible to dead players
 *   wolf-chat    – private channel for werewolves
 */
const { sanitizeString } = require('../../utils/sanitize');
const { getLobby } = require('../../state/lobbies');

const MAX_MSG_LEN = 300;

const broadcast = (io, socket, feedEvent) => ({ username, message } = {}) => {
  if (!socket.lobbyId) return;
  const cleanUsername = sanitizeString(username, 50);
  const cleanMessage = sanitizeString(message, MAX_MSG_LEN);
  if (!cleanUsername || !cleanMessage) return;
  io.to(socket.lobbyId).emit(feedEvent, { username: cleanUsername, message: cleanMessage });
};

const chatHandlers = (io, socket) => {
  socket.on('living-chat-send', broadcast(io, socket, 'living-chat-feed'));
  socket.on('wolf-chat-send',   broadcast(io, socket, 'wolf-chat-feed'));

  socket.on('ghost-chat-send', ({ username, message } = {}) => {
    if (!socket.lobbyId) return;
    const cleanUsername = sanitizeString(username, 50);
    const cleanMessage = sanitizeString(message, MAX_MSG_LEN);
    if (!cleanUsername || !cleanMessage) return;
    const msg = { username: cleanUsername, message: cleanMessage };
    const lobby = getLobby(socket.lobbyId);
    if (lobby) lobby.ghostChatHistory.push(msg);
    io.to(socket.lobbyId).emit('ghost-chat-feed', msg);
  });
};

module.exports = chatHandlers;