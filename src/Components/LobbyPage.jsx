import React, { useState, useEffect } from 'react'
import werewolfTitle from '../../public/images/werewolf-title.svg'
import werewolf from '../../public/images/werewolf.svg'
import { Container, Button, Form, InputGroup } from 'react-bootstrap'

const LobbyPage = ({ socket }) => {
    const [lobbies, setLobbies] = useState([])
    const [lobbyName, setLobbyName] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!socket) return

        // fetch intial list on mount
        socket.emit('get-lobbies')

        socket.on('lobbies-feed', (data) => setLobbies(data))
        socket.on('lobby-error', (msg) => setError(msg))

        return () => {
            socket.off('lobbies-feed')
            socket.off('lobby-error')
        }

    }, [socket])

    // create lobby. a text input bound to lobbyName and a submit button. on click:
    const handleCreate = () => {
        if (!lobbyName.trim()) return;
        setError(null)
        socket.emit('create-lobby', lobbyName.trim())
    }

    // join lobby. each lobby row has a join button. on click:
    const handleJoin = (id) => {
        setError(null)
        socket.emit('join-lobby', id)
    }

    return (
        <Container>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
                <img src={werewolfTitle} style={{ height: "35vh", margin: "-100px 0px" }} />
                <img src={werewolf} style={{ height: "35vh", marginTop: "-90px" }} />
            </span>

            <h3 className='column'>Lobby</h3>
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder='Lobby Name...'
                    value={lobbyName}
                    onChange={(e) => setLobbyName(e.target.value)}
                />
                <Button
                    onClick={handleCreate}
                    disabled={!lobbyName.trim() || lobbies.length >= 10}
                >
                    Create Lobby
                </Button>
            </InputGroup>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {lobbies.length === 0
                ? <p className='column'>No Open Lobbies. Create one to get started</p>
                : lobbies.map((lobby) => (
                    <div className="column" key={lobby.id}>
                        <span>{lobby.name}</span>
                        <span> - {lobby.playerCount} players</span>
                        <span> - Host: {lobby.hostName || 'none'} </span>
                        <span> - {lobby.gameStatus} </span>
                        <Button
                            onClick={() => handleJoin(lobby.id)}
                            disabled={lobby.gameStatus !== 'setup'}
                        >
                            Join
                        </Button>
                    </div>
                ))
            }
        </Container>
    )
}

export default LobbyPage