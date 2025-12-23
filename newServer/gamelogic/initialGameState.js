export const initialGameState = {
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
    wolves: {
        number: 0,
        players: [],
    },
    host: {},
    seerMessage: '',

}
