const { getLobby, deleteLobby, getLobbySummaries } = require("../../state/lobbies");

/**
 * Handles the 'disconnect' socket event.
 * Removes the player from gameState and transfers host if needed.
 */
const disconnectHandler = (io, socket) => {
  socket.on('disconnect', () => {
    const lobby = getLobby(socket.lobbyId)
    if (!lobby) return //player disconnected before ever joining a lobby
    const { gameState } = lobby;

    console.log(`User ${socket.id} disconnected`);

    const { playerInfo } = gameState;
    const index = playerInfo.findIndex((p) => p.player_id === socket.id);
    if (index === -1) return;

    const wasHost = playerInfo[index].host;
    playerInfo.splice(index, 1);

    if (wasHost && playerInfo.length > 0) {
      playerInfo[0].host = true;
      gameState.host = playerInfo[0];
      console.log(`Host disconnected — ${playerInfo[0].username} is the new host`);
    }

    if (gameState.playerInfo.length === 0) {
      deleteLobby(socket.lobbyId)
    }
    io.emit('lobbies-feed', getLobbySummaries())
  });
};

module.exports = disconnectHandler;