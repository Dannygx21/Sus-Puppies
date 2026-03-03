const CountDown = require("../../game/CountDown")
const { getLobbySummaries, createLobby, getLobby, deleteLobby, MAX_PLAYERS } = require("../../state/lobbies")
const { countLivingRoles } = require("../../game/phaseChange")

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

        // enforce player cap
        if (lobby.gameState.playerInfo.length >= MAX_PLAYERS) {
            socket.emit('lobby-error', 'Lobby is full (max 20 players)')
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

    socket.on('leave-lobby', () => {
        const lobby = getLobby(socket.lobbyId)
        if (!lobby) return

        const { gameState } = lobby
        const { playerInfo } = gameState
        const index = playerInfo.findIndex((p) => p.player_id === socket.id)
        const lobbyId = socket.lobbyId

        if (gameState.gameStatus === 'setup') {
            // ── Setup: remove the player entirely ──────────────────────────────
            if (index !== -1) {
                const wasHost = playerInfo[index].host
                playerInfo.splice(index, 1)

                if (wasHost && playerInfo.length > 0) {
                    playerInfo[0].host = true
                    gameState.host = playerInfo[0]
                }
            }

            socket.leave(lobbyId)
            socket.lobbyId = null

            if (playerInfo.length === 0) {
                deleteLobby(lobbyId)
            } else {
                io.to(lobbyId).emit('gameState-feed', gameState)
            }
        } else {
            // ── Mid-game: kill the character, check win conditions ─────────────
            if (index !== -1) {
                const player = playerInfo[index]

                // Mark alive roles as dead (even → odd). Dead players stay in
                // playerInfo so the rest of the lobby can see their fate.
                if (player.role % 2 === 0) {
                    player.role += 1
                    console.log(`${player.username} left mid-game — marked dead`)
                }

                // Strip any pending vote from this player
                gameState.votes = gameState.votes.filter(([voter]) => voter !== player.username)

                // Transfer host to the first still-alive player
                if (player.host) {
                    const nextHost = playerInfo.find((p, i) => i !== index && p.role % 2 === 0)
                    if (nextHost) {
                        player.host = false
                        nextHost.host = true
                        gameState.host = nextHost
                    }
                }
            }

            // Re-check win conditions after the player is gone
            const { numWolves, numVillagers } = countLivingRoles(playerInfo)
            if (numWolves === 0) {
                gameState.previousResult = 'Villagers Win!'
                gameState.gameStatus = 'ended'
                lobby.countdownTimer.stop()
            } else if (numWolves >= numVillagers) {
                gameState.previousResult = 'Wolves Win!'
                gameState.gameStatus = 'ended'
                lobby.countdownTimer.stop()
            }

            socket.leave(lobbyId)
            socket.lobbyId = null

            io.to(lobbyId).emit('gameState-feed', gameState)
        }

        socket.emit('left-lobby')
        io.emit('lobbies-feed', getLobbySummaries())
    })
}

module.exports = lobbyHandler