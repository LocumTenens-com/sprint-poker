import type * as Party from 'partykit/server'

interface Participant {
  id: string
  name: string
  avatar: string
  vote: number | null
  isHost: boolean
}

interface RoomState {
  participants: Participant[]
  revealed: boolean
  hostId: string
}

type ClientMessage =
  | { type: 'join'; name: string; avatar: string; isHost: boolean }
  | { type: 'vote'; value: number }
  | { type: 'reveal' }
  | { type: 'reset' }

export default class PokerRoom implements Party.Server {
  private participants = new Map<string, Participant>()
  private revealed = false
  private hostId = ''

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    // Send current state to newly connected client
    this.sendStateTo(conn)
  }

  onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    if (typeof message !== 'string') return

    let msg: ClientMessage
    try {
      msg = JSON.parse(message) as ClientMessage
    } catch {
      return
    }

    switch (msg.type) {
      case 'join': {
        const participant: Participant = {
          id: sender.id,
          name: msg.name,
          avatar: msg.avatar,
          vote: null,
          isHost: msg.isHost,
        }
        // First joiner or explicit host claim
        if (this.participants.size === 0 || msg.isHost) {
          if (!this.hostId) this.hostId = sender.id
        }
        this.participants.set(sender.id, participant)
        this.broadcastState()
        break
      }

      case 'vote': {
        const p = this.participants.get(sender.id)
        if (!p || this.revealed) return
        p.vote = msg.value
        this.participants.set(sender.id, p)
        this.broadcastState()
        break
      }

      case 'reveal': {
        if (sender.id !== this.hostId) return
        this.revealed = true
        this.broadcastState()
        break
      }

      case 'reset': {
        if (sender.id !== this.hostId) return
        this.revealed = false
        for (const p of this.participants.values()) {
          p.vote = null
        }
        this.broadcastState()
        break
      }
    }
  }

  onClose(conn: Party.Connection) {
    this.participants.delete(conn.id)
    // Reassign host if needed
    if (conn.id === this.hostId) {
      const first = this.participants.values().next().value
      if (first) {
        this.hostId = first.id
        first.isHost = true
      } else {
        this.hostId = ''
      }
    }
    this.broadcastState()
  }

  private getState(): RoomState {
    return {
      participants: Array.from(this.participants.values()),
      revealed: this.revealed,
      hostId: this.hostId,
    }
  }

  private broadcastState() {
    const payload = JSON.stringify({ type: 'state', state: this.getState() })
    this.room.broadcast(payload)
  }

  private sendStateTo(conn: Party.Connection) {
    const payload = JSON.stringify({ type: 'state', state: this.getState() })
    conn.send(payload)
  }
}
