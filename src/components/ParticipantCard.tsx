import type { Participant } from '../types'
import { Avatar } from './Avatar'

interface ParticipantCardProps {
  participant: Participant
  revealed: boolean
}

export function ParticipantCard({ participant, revealed }: ParticipantCardProps) {
  const hasVoted = participant.vote !== null
  const isFlipped = hasVoted && revealed

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Mini card */}
      <div className="card-flip w-12 h-16">
        <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div
            className={`card-face rounded-lg border-2 ${
              hasVoted
                ? 'bg-indigo-500 border-indigo-300'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            {hasVoted ? (
              <span className="text-white text-sm">✓</span>
            ) : (
              <span className="text-gray-300 text-xs">?</span>
            )}
          </div>
          {/* Back */}
          <div className="card-face card-back rounded-lg border-2 bg-white border-indigo-300">
            <span className="text-indigo-700 font-bold text-lg">{participant.vote}</span>
          </div>
        </div>
      </div>

      {/* Avatar */}
      <Avatar url={participant.avatar} name={participant.name} size={32} />

      {/* Name */}
      <span className="text-xs text-gray-600 text-center max-w-[64px] truncate">
        {participant.name}
        {participant.isHost && ' 👑'}
      </span>
    </div>
  )
}
