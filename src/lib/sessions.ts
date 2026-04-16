import { cookies } from 'next/headers'
import crypto from 'crypto'

const SECRET = process.env.ADMIN_PASSWORD || 'fallback-secret'

function createHmac(value: string): string {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex')
}

export function createToken(): string {
  const id = crypto.randomUUID()
  const sig = createHmac(id)
  return `${id}.${sig}`
}

export function isValidToken(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [id, sig] = parts
  const expected = createHmac(id)
  return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
}

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('admin_token')?.value
}
