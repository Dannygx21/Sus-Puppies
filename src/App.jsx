import React, { useEffect, useState } from 'react'
import LobbyPage from './Components/LobbyPage.jsx'
import GamePage from './GamePage.jsx'
import { io } from 'socket.io-client'

const App = () => {
    const [socket, setSocket] = useState(null)
    const [lobbyId, setLobbyId] = useState(null)
    const [view, setView] = useState('lobby')

    useEffect(() => {
        setSocket(io())
    }, [])

    useEffect(() => {
        if (!socket) return;
        socket.on('lobby-joined', ({ lobbyId }) => {
            setLobbyId(lobbyId)
            setView('game')
        })
        return () => socket.off('lobby-joined')
    }, [socket])

    return (
        <>
            {view === 'lobby' && <LobbyPage socket={socket} />}
            {view === 'game' && <GamePage socket={socket} lobbyId={lobbyId} />}
        </>
    )
}

export default App;