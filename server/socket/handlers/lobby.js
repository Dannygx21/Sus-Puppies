const CountDown = require("../../game/CountDown")
const { getLobbySummaries, createLobby, getLobby } = require("../../state/lobbies")

const lobbyHandler = (io, socket) => {
    socket.on('get-lobbies', () => {
        // only emits back to the requesting lobby
        socket.emit('lobbies-feed', getLobbySummaries())
    })

    socket.on('create-lobby', (name) => {
        const newLobby = createLobby(name)
        // if createLobby returns null, means max lobbies has been reached
        // early return
        if (!newLobby) {
            socket.emit('lobby-error', 'Server is full')
            return
        }

        // this is where countdownTimer gets created and attached.
        // also have io and lobby id 
        newLobby.countdownTimer = new CountDown(newLobby.gameState, (time) => {
            io.to(newLobby.id).emit('timer-feed', time);
        })

        // this puts the socket into the socket.io room for this lobby
        socket.join(newLobby.id)
        // this is how every other handler later knows which lobby this socket belongs to
        socket.lobbyId = newLobby.id
        // emit back to the socket with the full lobby state (client need this to transition to the game page)
        socket.emit('lobby-joined', { lobbyId: newLobby.id, gameState: newLobby.gameState })
        // broadcast the updated lobby list to everyone so other client's lobby browser refresh  
        io.emit('lobbies-feed', getLobbySummaries())

    })

    socket.on('join-lobby', (id) => {
        const lobby = getLobby(id)
        // if undefined, emit to socket error and early return
        if (!lobby) {
            socket.emit('lobby-error', 'Lobby not found')
            return
        }

        // if lobby is playing, players can't join
        if (lobby.gameState.gameStatus !== 'setup') {
            socket.emit('lobby-error', 'Game in progress, please wait until lobby is waiting to start')
            return
        }

        // this puts the socket into the socket.io room for this lobby
        socket.join(lobby.id)
        // this is how every other handler later knows which lobby this socket belongs to
        socket.lobbyId = lobby.id
        // emit back to the socket with the full lobby state (client need this to transition to the game page)
        socket.emit('lobby-joined', { lobbyId: lobby.id, gameState: lobby.gameState })
        // broadcast the updated lobby list to everyone so other client's lobby browser refresh  
        io.emit('lobbies-feed', getLobbySummaries())

    })
}

module.exports = lobbyHandler