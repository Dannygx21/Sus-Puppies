const { phaseChange, countLivingRoles } = require('../../game/phaseChange');

/**
 * Handles the 'vote-send' socket event.
 * Collects votes and triggers phaseChange once all required votes are in.
 *
 * Day phase:  all living players must vote
 * Night phase: only wolves + specialists (Seer/Healer) vote
 */
const voteHandler = (io, socket, gameState, countdownTimer) => {
  socket.on('vote-send', (voteTuple) => {
    gameState.votes.push(voteTuple);

    const { numWolves, numVillagers, numSpecialists } = countLivingRoles(gameState.playerInfo);
    const numLiving = numWolves + numVillagers;
    const votesNeeded = gameState.currentPhase === 'day'
      ? numLiving
      : numWolves + numSpecialists;

    if (gameState.votes.length === votesNeeded) {
      phaseChange(gameState, io, countdownTimer);
    }
  });
};

module.exports = voteHandler;