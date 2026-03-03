const { randomUUID } = require('crypto');
const { createGameState } = require('./gameState')

const MAX_LOBBIES = 10;
const MAX_PLAYERS = 20;

const lobbies = new Map();

const createLobby = (name) => {
    // creates a new lobby entry in the map.
    // check that the map size hasnt hit MAX_LOBBIES first
    // if it has return null.
    if (lobbies.size >= MAX_LOBBIES) return null

    const id = randomUUID();
    // Store it in the map an return the new lobby object
    const lobby = { id, name, gameState: createGameState(), countdownTimer: null }
    lobbies.set(id, lobby)
    return lobby
}

const getLobby = (lobbyId) => {
    //returns lobbies.get(lobbyId) or undefined
    return lobbies.get(lobbyId)
}

const deleteLobby = (lobbyId) => {
    //calls lobbies.delete(lobbyId). Call this when the last player disconnects from a lobby 
    lobbies.delete(lobbyId)
}

const getLobbySummaries = () => {
    //iterates the map and returns a lightway array for the client. each entry should only include what the lobby browser needs to display:
    // {id, lobbyname, playercount, gamestatus, hostName}
    // playercount comes from lobby.gamestate.playerInfo.length. gamestatus comes from lobby.gameState.gameStatus
    return Array.from(lobbies.values()).map((lobby) => ({
        id: lobby.id,
        name: lobby.name,
        playerCount: lobby.gameState.playerInfo.length,
        gameStatus: lobby.gameState.gameStatus,
        hostName: lobby.gameState.host?.username || null
    }))
}

module.exports = { MAX_LOBBIES, MAX_PLAYERS, createLobby, getLobby, deleteLobby, getLobbySummaries }