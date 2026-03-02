const ROLE_NAMES = [
  'Villager', 'Dead Villager',
  'Werewolf', 'Dead Werewolf',
  'Seer', 'Dead Seer',
  'Healer', 'Dead Healer',
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Counts alive wolves, villagers (including specialists), and specialists.
 * Specialists = Seer (4) and Healer (6).
 */
const countLivingRoles = (playerInfo) => {
  let numWolves = 0;
  let numVillagers = 0;
  let numSpecialists = 0;

  for (const player of playerInfo) {
    if (player.role === 2) numWolves++;
    if (player.role === 4 || player.role === 6) numSpecialists++;
    if (player.role === 0 || player.role === 4 || player.role === 6) numVillagers++;
  }

  return { numWolves, numVillagers, numSpecialists };
};

/**
 * Tallies an array of [voter, target] tuples into a { [target]: count } map.
 */
const tallyVotes = (votes) => {
  const tally = {};
  for (const [, target] of votes) {
    tally[target] = (tally[target] || 0) + 1;
  }
  return tally;
};

/**
 * Returns the candidate with the most votes. Ties are broken by coin flip.
 */
const getTopVote = (tally) => {
  let victim = '';
  let maxVotes = -1;

  for (const [name, count] of Object.entries(tally)) {
    if (count > maxVotes) {
      victim = name;
      maxVotes = count;
    } else if (count === maxVotes && Math.random() < 0.5) {
      victim = name;
    }
  }

  return { victim, maxVotes };
};

/** Kills a player by incrementing their role to its dead equivalent. */
const killPlayer = (playerInfo, username) => {
  const player = playerInfo.find((p) => p.username === username);
  if (player) player.role += 1; // e.g. 0 (alive villager) → 1 (dead villager)
};

// ─── Day phase ────────────────────────────────────────────────────────────────

const resolveDayVote = (gameState) => {
  const { numWolves, numVillagers } = countLivingRoles(gameState.playerInfo);
  const majority = Math.round((numWolves + numVillagers) / 2);

  const tally = tallyVotes(gameState.votes);
  const { victim, maxVotes } = getTopVote(tally);

  if (maxVotes >= majority && victim && victim !== 'NULL') {
    killPlayer(gameState.playerInfo, victim);
    gameState.previousResult = `${victim} was killed yesterday!`;
    gameState.phaseResults.push([gameState.currentDay, 'day', victim]);
  } else {
    gameState.previousResult = 'No one was killed yesterday.';
    gameState.phaseResults.push([gameState.currentDay, 'day', 'No one']);
  }
};

// ─── Night phase ──────────────────────────────────────────────────────────────

const resolveNightVote = (gameState) => {
  const { playerInfo, votes } = gameState;
  let seerTarget = '';
  let healerTarget = '';
  const wolfVotes = {};

  for (const [voterName, target] of votes) {
    const voter = playerInfo.find((p) => p.username === voterName);
    if (!voter) continue;

    if (voter.role === 4) {
      // Seer: inspect target and store the result
      seerTarget = target;
      if (target && target !== 'NULL' && target !== 'select a player') {
        const targetPlayer = playerInfo.find((p) => p.username === target);
        if (targetPlayer) {
          gameState.seerMessage = `${target} is actually a ${ROLE_NAMES[targetPlayer.role]}`;
        }
      }
    } else if (voter.role === 6) {
      // Healer: protect target
      healerTarget = target;
    } else {
      // Wolf: vote to kill
      wolfVotes[target] = (wolfVotes[target] || 0) + 1;
    }
  }

  let { victim } = getTopVote(wolfVotes);

  // If wolves didn't cast a valid vote, pick a random living non-wolf
  if (!victim || victim === 'NULL') {
    const eligible = playerInfo.filter((p) => p.role === 0 || p.role === 4 || p.role === 6);
    victim = eligible[Math.floor(Math.random() * eligible.length)]?.username || '';
  }

  if (victim && victim !== healerTarget) {
    killPlayer(playerInfo, victim);
    gameState.previousResult = `${victim} was eaten last night!`;
    gameState.phaseResults.push([gameState.currentDay, 'night', victim]);
  } else {
    gameState.previousResult = 'No one was eaten last night.';
    gameState.phaseResults.push([gameState.currentDay, 'night', 'No one']);
  }
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Resolves the current phase's votes, updates gameState, checks win conditions,
 * and advances to the next phase (or ends the game).
 * Emits updated gameState to all clients.
 */
const phaseChange = (gameState, io, countdownTimer) => {
  if (gameState.currentPhase === 'day') {
    resolveDayVote(gameState);
  } else {
    resolveNightVote(gameState);
  }

  // Recount after resolution to check win conditions
  const { numWolves, numVillagers } = countLivingRoles(gameState.playerInfo);

  if (numWolves === 0) {
    gameState.previousResult = 'Villagers Win!';
    gameState.gameStatus = 'ended';
    countdownTimer.stop();
    console.log('Villagers win');
  } else if (numWolves >= numVillagers) {
    gameState.previousResult = 'Wolves Win!';
    gameState.gameStatus = 'ended';
    countdownTimer.stop();
    console.log('Wolves win');
  } else if (gameState.currentPhase === 'day') {
    gameState.currentPhase = 'night';
    gameState.votes = [];
    countdownTimer.newCountDown();
  } else {
    gameState.currentPhase = 'day';
    gameState.currentDay++;
    gameState.votes = [];
    countdownTimer.newCountDown();
  }

  io.emit('gameState-feed', gameState);
};

module.exports = { phaseChange, countLivingRoles };