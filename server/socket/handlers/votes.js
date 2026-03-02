const { phaseChange, countLivingRoles } = require('../../game/phaseChange');
const { getLobby } = require('../../state/lobbies');

/**
 * Handles the 'vote-send' socket event.
 * Collects votes and triggers phaseChange once all required votes are in.
 *
 * Day phase:  all living players must vote
 * Night phase: only wolves + specialists (Seer/Healer) vote
 */
const voteHandler = (io, socket) => {
  socket.on('vote-send', (voteTuple) => {
    const lobby = getLobby(socket.lobbyId)
    if (!lobby) return;
    const { gameState, countdownTimer } = lobby

    gameState.votes.push(voteTuple);

    const { numWolves, numVillagers, numSpecialists } = countLivingRoles(gameState.playerInfo);
    const numLiving = numWolves + numVillagers;
    const votesNeeded = gameState.currentPhase === 'day'
      ? numLiving
      : numWolves + numSpecialists;

    if (gameState.votes.length === votesNeeded) {
      phaseChange(gameState, io, countdownTimer, socket.lobbyId);
    }
  });
};

module.exports = voteHandler;