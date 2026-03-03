/**
 * Randomly assigns special roles to players in gameState.playerInfo.
 * All players start as role 0 (Villager). This mutates playerInfo in place.
 *
 * Role codes:
 *   0 = Villager  |  2 = Werewolf  |  4 = Seer  |  6 = Healer
 *   Odd = dead version of each role (role + 1)
 */
const assignRoles = (gameState) => {
  const { playerInfo, wolves, isSeer, isHealer } = gameState;

  const specialCount = (isSeer ? 1 : 0) + (isHealer ? 1 : 0);
  const totalSpecial = wolves.number + specialCount;

  if (playerInfo.length === 0 || totalSpecial > playerInfo.length) {
    console.error(
      `assignRoles: cannot assign ${totalSpecial} special roles to ${playerInfo.length} players`
    );
    return;
  }

  // Fisher-Yates shuffle of player indices — O(n), guaranteed to terminate
  const indices = playerInfo.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  let cursor = 0;

  for (let w = 0; w < wolves.number; w++) {
    playerInfo[indices[cursor++]].role = 2;
  }

  if (isSeer) {
    playerInfo[indices[cursor++]].role = 4;
  }

  if (isHealer) {
    playerInfo[indices[cursor++]].role = 6;
  }
};

module.exports = assignRoles;