import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import PartySocket from 'partysocket'
import type { RoomState, FibValue, ClientMessage, ServerMessage } from '../types'
import { FIBONACCI } from '../types'
import { loadUserCookie, average } from '../utils'
import { Avatar } from '../components/Avatar'
import { SelectableCard } from '../components/PokerCard'
import { ParticipantCard } from '../components/ParticipantCard'

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999'

export function Room() {
  const { code } = useParams<{ code: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isHost = searchParams.get('host') === '1'

  const [state, setState] = useState<RoomState | null>(null)
  const [myVote, setMyVote] = useState<FibValue | null>(null)
  const [copied, setCopied] = useState(false)
  const [connectionError, setConnectionError] = useState(false)

  const socketRef = useRef<PartySocket | null>(null)
  const myIdRef = useRef<string>('')

  const user = loadUserCookie()

  useEffect(() => {
    if (!user || !code) {
      navigate('/')
      return
    }

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: code,
    })
    socketRef.current = socket
    myIdRef.current = socket.id

    socket.addEventListener('open', () => {
      setConnectionError(false)
      const msg: ClientMessage = {
        type: 'join',
        name: user.name,
        avatar: user.avatar,
        isHost,
      }
      socket.send(JSON.stringify(msg))
    })

    socket.addEventListener('message', (event: MessageEvent) => {
      const msg = JSON.parse(event.data) as ServerMessage
      if (msg.type === 'state') {
        setState(msg.state)
        // Sync local vote with server state
        const me = msg.state.participants.find(p => p.id === socket.id)
        if (me) setMyVote(me.vote)
      }
    })

    socket.addEventListener('close', () => {
      setConnectionError(true)
    })

    return () => {
      socket.close()
    }
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg))
  }, [])

  function handleVote(value: FibValue) {
    if (state?.revealed) return
    setMyVote(value)
    send({ type: 'vote', value })
  }

  function handleReveal() {
    send({ type: 'reveal' })
  }

  function handleReset() {
    setMyVote(null)
    send({ type: 'reset' })
  }

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname.split('/room')[0]}#/room/${code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const mySocketId = socketRef.current?.id
  const amHost = state?.hostId === mySocketId || (!state && isHost)
  const votes = state?.participants.map(p => p.vote).filter((v): v is FibValue => v !== null) ?? []
  const allVoted = state ? state.participants.length > 0 && state.participants.every(p => p.vote !== null) : false
  const avg = state?.revealed ? average(votes.map(Number)) : null

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection lost</h2>
          <p className="text-gray-500 mb-6">Reconnecting...</p>
          <Link to="/" className="text-indigo-600 hover:underline text-sm">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800">
          🃏 <span className="hidden sm:inline">Sprint Poker</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Room</div>
            <div className="font-mono font-bold text-gray-800 tracking-widest text-lg">{code}</div>
          </div>
          <button
            onClick={copyLink}
            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
          >
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
            <Avatar url={user.avatar} name={user.name} size={32} />
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col p-4 gap-6 max-w-4xl mx-auto w-full">
        {/* Participants */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Participants
              {state && <span className="text-gray-400 font-normal ml-2">({state.participants.length})</span>}
            </h2>

            {state?.revealed && avg !== null && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-xl font-semibold">
                Average: {avg}
              </div>
            )}
          </div>

          {!state ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              Connecting…
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
              {state.participants.map(p => (
                <ParticipantCard
                  key={p.id}
                  participant={p}
                  revealed={state.revealed}
                />
              ))}
            </div>
          )}
        </section>

        {/* Voting area */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              {state?.revealed ? '🎉 Results' : 'Cast your vote'}
            </h2>
            {state?.revealed && (
              <div className="flex flex-wrap gap-2 text-sm">
                {Object.entries(
                  votes.reduce<Record<number, number>>((acc, v) => {
                    acc[v] = (acc[v] ?? 0) + 1
                    return acc
                  }, {})
                )
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([v, count]) => (
                    <span key={v} className="bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {v} × {count}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {FIBONACCI.map(v => (
              <SelectableCard
                key={v}
                value={v}
                selected={myVote === v}
                onClick={() => handleVote(v)}
                disabled={state?.revealed}
              />
            ))}
          </div>

          {myVote !== null && !state?.revealed && (
            <p className="text-center text-indigo-600 text-sm mt-3">
              You voted <strong>{myVote}</strong>
              {allVoted && ' · Everyone has voted!'}
            </p>
          )}
        </section>

        {/* Host controls */}
        {amHost && (
          <section className="flex gap-3 justify-center flex-wrap">
            {!state?.revealed ? (
              <button
                onClick={handleReveal}
                disabled={votes.length === 0}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                👁 Reveal Cards
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                🔄 New Round
              </button>
            )}
          </section>
        )}

        {!amHost && state && (
          <p className="text-center text-gray-400 text-sm">
            Waiting for the host to {state.revealed ? 'start a new round' : 'reveal cards'}…
          </p>
        )}
      </main>
    </div>
  )
}
