import 'server-only'
import crypto from 'crypto'
import { supabaseAdmin } from './supabase'

export type MetaSettings = {
  pixel_id: string | null
  access_token: string | null
  test_event_code: string | null
}

let cache: { value: MetaSettings; expires: number } | null = null
const TTL_MS = 30_000

export async function getMetaSettings(): Promise<MetaSettings> {
  const now = Date.now()
  if (cache && cache.expires > now) return cache.value

  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('meta_pixel_id, meta_access_token, meta_test_event_code')
    .eq('id', 1)
    .maybeSingle()

  const value: MetaSettings = error || !data
    ? { pixel_id: null, access_token: null, test_event_code: null }
    : {
        pixel_id: data.meta_pixel_id ?? null,
        access_token: data.meta_access_token ?? null,
        test_event_code: data.meta_test_event_code ?? null,
      }

  cache = { value, expires: now + TTL_MS }
  return value
}

export function invalidateMetaSettingsCache() {
  cache = null
}

export type CapiTestResult =
  | { ok: true; status: number; response: unknown; usedTestCode: boolean }
  | { ok: false; reason: 'missing_pixel' | 'missing_token' | 'network' | 'meta_error'; status?: number; error?: string; response?: unknown }

/**
 * Envia um evento "Lead" de teste (dados dummy hasheados) para a Conversions API
 * e retorna a resposta bruta da Meta. Usado pelo admin para validar config.
 */
export async function testCapiConnection(): Promise<CapiTestResult> {
  const settings = await getMetaSettings()
  if (!settings.pixel_id) return { ok: false, reason: 'missing_pixel', error: 'Pixel ID não configurado' }
  if (!settings.access_token) return { ok: false, reason: 'missing_token', error: 'Access Token não configurado' }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: `test_${crypto.randomUUID()}`,
        action_source: 'website',
        event_source_url: 'https://adila-presentes.vercel.app/',
        user_data: {
          fn: sha256('teste'),
          ln: sha256('admin'),
          ph: sha256('5531999999999'),
        },
      },
    ],
  }
  if (settings.test_event_code) {
    payload.test_event_code = settings.test_event_code
  }

  const url = `https://graph.facebook.com/v19.0/${settings.pixel_id}/events?access_token=${encodeURIComponent(settings.access_token)}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        reason: 'meta_error',
        status: res.status,
        response: body,
        error: typeof body?.error?.message === 'string' ? body.error.message : `HTTP ${res.status}`,
      }
    }
    return { ok: true, status: res.status, response: body, usedTestCode: !!settings.test_event_code }
  } catch (e) {
    return { ok: false, reason: 'network', error: e instanceof Error ? e.message : 'fetch falhou' }
  }
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function normalizePhoneE164BR(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

function normalizeName(raw: string): string {
  return raw.trim().toLowerCase()
}

export type CapiLeadInput = {
  nome_completo: string
  celular: string
  ip?: string | null
  user_agent?: string | null
  event_source_url?: string | null
  fbp?: string | null
  fbc?: string | null
}

/**
 * Envia evento "Lead" para a Conversions API (Meta).
 * Falha silenciosamente em caso de erro de rede/config — não deve quebrar o fluxo de captura.
 */
export async function sendCapiLead(input: CapiLeadInput): Promise<void> {
  const settings = await getMetaSettings()
  if (!settings.pixel_id || !settings.access_token) return

  const parts = input.nome_completo.trim().split(/\s+/)
  const fn = normalizeName(parts[0] ?? '')
  const ln = normalizeName(parts.slice(1).join(' '))
  const phone = normalizePhoneE164BR(input.celular)

  const user_data: Record<string, string | string[]> = {}
  if (fn) user_data.fn = sha256(fn)
  if (ln) user_data.ln = sha256(ln)
  if (phone) user_data.ph = sha256(phone)
  if (input.ip) user_data.client_ip_address = input.ip
  if (input.user_agent) user_data.client_user_agent = input.user_agent
  if (input.fbp) user_data.fbp = input.fbp
  if (input.fbc) user_data.fbc = input.fbc

  const event_id = crypto.randomUUID()
  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        action_source: 'website',
        event_source_url: input.event_source_url || undefined,
        user_data,
      },
    ],
  }
  if (settings.test_event_code) {
    payload.test_event_code = settings.test_event_code
  }

  const url = `https://graph.facebook.com/v19.0/${settings.pixel_id}/events?access_token=${encodeURIComponent(settings.access_token)}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[meta CAPI] non-200', res.status, text)
    }
  } catch (e) {
    console.error('[meta CAPI] fetch failed', e)
  }
}
