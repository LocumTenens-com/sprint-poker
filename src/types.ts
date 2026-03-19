export const FIBONACCI = [1, 2, 3, 5, 8, 13, 21] as const

export type FibValue = typeof FIBONACCI[number]

export interface Participant {
  id: string
  name: string
  avatar: string
  vote: FibValue | null
  isHost: boolean
}

export interface RoomState {
  participants: Participant[]
  revealed: boolean
  hostId: string
}

// Messages sent from client to server
export type ClientMessage =
  | { type: 'join'; name: string; avatar: string; isHost: boolean }
  | { type: 'vote'; value: FibValue }
  | { type: 'reveal' }
  | { type: 'reset' }

// Messages sent from server to client
export type ServerMessage =
  | { type: 'state'; state: RoomState }
  | { type: 'error'; message: string }
