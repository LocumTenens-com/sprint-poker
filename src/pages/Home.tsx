import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { generateRoomCode, generateAvatarUrl, saveUserCookie, loadUserCookie } from '../utils'

export function Home() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).slice(2))
  const [roomCode, setRoomCode] = useState('')
  const [tab, setTab] = useState<'create' | 'join'>('create')

  // Load saved user from cookie
  useEffect(() => {
    const saved = loadUserCookie()
    if (saved) {
      setName(saved.name)
      // Extract seed from saved avatar URL
      const match = saved.avatar.match(/seed=([^&]+)/)
      if (match) setAvatarSeed(decodeURIComponent(match[1]))
    }
  }, [])

  const avatarUrl = generateAvatarUrl(avatarSeed || name || avatarSeed)

  function refreshAvatar() {
    setAvatarSeed(Math.random().toString(36).slice(2))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const code = generateRoomCode()
    saveUserCookie({ name: name.trim(), avatar: avatarUrl })
    navigate(`/room/${code}?host=1`)
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !roomCode.trim()) return
    saveUserCookie({ name: name.trim(), avatar: avatarUrl })
    navigate(`/room/${roomCode.trim().toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🃏</div>
          <h1 className="text-3xl font-bold text-gray-900">Sprint Poker</h1>
          <p className="text-gray-500 mt-1">Real-time planning poker for agile teams</p>
        </div>

        {/* Avatar & Name */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <Avatar url={avatarUrl} name={name || 'You'} size={80} />
            <button
              type="button"
              onClick={refreshAvatar}
              className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-indigo-700 transition-colors"
              title="Random avatar"
            >
              ↺
            </button>
          </div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'create'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setTab('create')}
          >
            Create Room
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'join'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setTab('join')}
          >
            Join Room
          </button>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreate}>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create New Room
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Room code (e.g. AB3X9K)"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={!name.trim() || roomCode.trim().length !== 6}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Join Room
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
