/**
 * Handles the 'disconnect' socket event.
 * Removes the player from gameState and transfers host if needed.
 */
const disconnectHandler = (socket, gameState) => {
  socket.on('disconnect', () => {
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
  });
};

module.exports = disconnectHandler;