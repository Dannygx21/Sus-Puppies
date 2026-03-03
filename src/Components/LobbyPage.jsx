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

        socket.emit('get-lobbies')

        socket.on('lobbies-feed', (data) => setLobbies(data))
        socket.on('lobby-error', (msg) => setError(msg))

        return () => {
            socket.off('lobbies-feed')
            socket.off('lobby-error')
        }
    }, [socket])

    const handleCreate = () => {
        if (!lobbyName.trim()) return
        setError(null)
        socket.emit('create-lobby', lobbyName.trim())
    }

    const handleJoin = (id) => {
        setError(null)
        socket.emit('join-lobby', id)
    }

    return (
        <Container style={{ maxWidth: '720px' }}>

            {/* ── Hero ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 10px' }}>
                <img src={werewolfTitle} style={{ height: '28vh', margin: '-70px 0' }} />
                <img src={werewolf} style={{ height: '28vh', marginTop: '-60px' }} />
            </div>

            {/* ── Create Lobby ── */}
            <div className="whiteCard" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,.2)', marginBottom: '8px' }}>
                <h5 style={{ color: 'white', fontFamily: "'Quintessential', cursive", marginBottom: '14px' }}>
                    Create a Lobby
                </h5>
                <InputGroup>
                    <Form.Control
                        className="lobby-input"
                        type="text"
                        placeholder="Lobby name..."
                        value={lobbyName}
                        onChange={(e) => setLobbyName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <Button
                        variant="danger"
                        onClick={handleCreate}
                        disabled={!lobbyName.trim() || lobbies.length >= 10}
                    >
                        Create
                    </Button>
                </InputGroup>
                {error && (
                    <p style={{ color: 'rgb(255, 22, 22)', marginTop: '10px', marginBottom: 0, fontSize: '0.9rem' }}>
                        {error}
                    </p>
                )}
            </div>

            {/* ── Lobby List ── */}
            <div style={{ marginTop: '16px' }}>
                <h3 className="column">Open Lobbies</h3>

                {lobbies.length === 0 ? (
                    <div
                        className="whiteCard"
                        style={{ textAlign: 'center', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '28px' }}
                    >
                        No open lobbies — create one to get started!
                    </div>
                ) : (
                    lobbies.map((lobby) => {
                        const isJoinable = lobby.gameStatus === 'setup'
                        return (
                            <div className="lobby-card" key={lobby.id}>

                                {/* Left: name + host */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: "'Quintessential', cursive", fontSize: '1.1rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {lobby.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.55)', marginTop: '3px' }}>
                                        Host: {lobby.hostName || '—'}
                                    </div>
                                </div>

                                {/* Right: player count, status badge, join button */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0, marginLeft: '12px' }}>
                                    <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        {lobby.playerCount} / 35
                                    </span>
                                    <span
                                        className="lobby-status-badge"
                                        style={isJoinable
                                            ? { background: 'rgba(40,167,69,.2)', border: '1px solid rgba(40,167,69,.65)', color: '#6ddb8e' }
                                            : { background: 'rgba(255,22,22,.15)', border: '1px solid rgba(255,22,22,.4)', color: 'rgba(255,110,110,.9)' }
                                        }
                                    >
                                        {isJoinable ? 'Open' : lobby.gameStatus}
                                    </span>
                                    <Button
                                        variant={isJoinable ? 'outline-danger' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => handleJoin(lobby.id)}
                                        disabled={!isJoinable}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        Join
                                    </Button>
                                </div>

                            </div>
                        )
                    })
                )}
            </div>

        </Container>
    )
}

export default LobbyPage