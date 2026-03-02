const initialState = {
  timer: 90,
  initTimer: 90,
  previousResult: 'Welcome to Werewolf',
  currentDay: 0,
  currentPhase: 'day',
  phaseResults: [],
  playerInfo: [],
  gameStatus: 'setup',
  votes: [],
  initWolves: 1,
  isSeer: false,
  isHealer: false,
  wolves: { number: 0, players: [] },
  host: {},
  seerMessage: '',
};

// Deep clone so nested objects/arrays are fresh each reset
const createGameState = () => JSON.parse(JSON.stringify(initialState));
/**
 * Resets gameState back to its initial values.
 * Pass a `preserve` object to keep specific properties (e.g. playerInfo, host).
 * Mutates gameState in place so all existing references stay valid.
 */
const resetGameState = (gameState, preserve = {}) => {
  const fresh = JSON.parse(JSON.stringify(initialState));
  Object.assign(gameState, fresh, preserve);
};

module.exports = { createGameState, resetGameState };