const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

const COOKIE_NAME = 'sprint_poker_user'

export interface UserCookie {
  name: string
  avatar: string
}

export function saveUserCookie(user: UserCookie): void {
  const value = encodeURIComponent(JSON.stringify(user))
  document.cookie = `${COOKIE_NAME}=${value};max-age=${60 * 60 * 24 * 30};path=/`
}

export function loadUserCookie(): UserCookie | null {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')))
  } catch {
    return null
  }
}

export function average(votes: number[]): number {
  if (votes.length === 0) return 0
  return Math.round((votes.reduce((a, b) => a + b, 0) / votes.length) * 10) / 10
}
