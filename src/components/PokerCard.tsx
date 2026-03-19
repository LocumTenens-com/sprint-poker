import type { FibValue } from '../types'

interface PokerCardProps {
  value: FibValue | null
  revealed: boolean
  selected: boolean
  onClick?: () => void
  disabled?: boolean
}

export function PokerCard({ value, revealed, selected, onClick, disabled }: PokerCardProps) {
  const isFlipped = value !== null && revealed

  return (
    <div
      className={`card-flip w-16 h-24 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front face (hidden/back of card) */}
        <div
          className={`card-face ${
            selected
              ? 'bg-indigo-600 border-2 border-indigo-400 shadow-lg shadow-indigo-300'
              : 'bg-indigo-500 border-2 border-indigo-300'
          }`}
        >
          <span className="text-white text-2xl">🃏</span>
        </div>

        {/* Back face (revealed value) */}
        <div
          className={`card-face card-back ${
            selected
              ? 'bg-indigo-600 border-2 border-indigo-400 text-white shadow-lg'
              : 'bg-white border-2 border-indigo-300 text-indigo-700'
          }`}
        >
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </div>
    </div>
  )
}

interface SelectableCardProps {
  value: FibValue
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export function SelectableCard({ value, selected, onClick, disabled }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-14 h-20 rounded-xl text-xl font-bold border-2 transition-all duration-150 select-none
        ${selected
          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-200 scale-110'
          : 'bg-white border-indigo-300 text-indigo-700 hover:border-indigo-500 hover:scale-105'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {value}
    </button>
  )
}
