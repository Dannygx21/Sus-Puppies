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

  // Assign werewolves
  let wolvesLeft = wolves.number;
  while (wolvesLeft > 0) {
    const i = Math.floor(Math.random() * playerInfo.length);
    if (playerInfo[i].role === 0) {
      playerInfo[i].role = 2;
      wolvesLeft--;
    }
  }

  // Assign Seer
  if (isSeer) {
    let assigned = false;
    while (!assigned) {
      const i = Math.floor(Math.random() * playerInfo.length);
      if (playerInfo[i].role === 0) {
        playerInfo[i].role = 4;
        assigned = true;
      }
    }
  }

  // Assign Healer
  if (isHealer) {
    let assigned = false;
    while (!assigned) {
      const i = Math.floor(Math.random() * playerInfo.length);
      if (playerInfo[i].role === 0) {
        playerInfo[i].role = 6;
        assigned = true;
      }
    }
  }
};

module.exports = assignRoles;