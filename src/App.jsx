import React, { useEffect, useState } from 'react'
import LobbyPage from './Components/LobbyPage.jsx'
import GamePage from './GamePage.jsx'
import { io } from 'socket.io-client'

const App = () => {
    const [socket, setSocket] = useState(null)
    const [lobbyId, setLobbyId] = useState(null)
    const [view, setView] = useState('lobby')
    const [initialPlayerInfo, setInitialPlayerInfo] = useState([])

    useEffect(() => {
        setSocket(io())
    }, [])

    useEffect(() => {
        if (!socket) return;
        socket.on('lobby-joined', ({ lobbyId, gameState }) => {
            setInitialPlayerInfo(gameState?.playerInfo || [])
            setLobbyId(lobbyId)
            setView('game')
        })
        socket.on('left-lobby', () => {
            setInitialPlayerInfo([])
            setLobbyId(null)
            setView('lobby')
        })
        return () => {
            socket.off('lobby-joined')
            socket.off('left-lobby')
        }
    }, [socket])

    return (
        <>
            {view === 'lobby' && <LobbyPage socket={socket} />}
            {view === 'game' && <GamePage socket={socket} lobbyId={lobbyId} initialPlayerInfo={initialPlayerInfo} />}
        </>
    )
}

export default App;