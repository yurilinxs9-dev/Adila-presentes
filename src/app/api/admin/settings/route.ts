import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/sessions'
import { invalidateMetaSettingsCache } from '@/lib/meta'

const MASK = '••••••••'

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  return !!token && isValidToken(token)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('meta_pixel_id, meta_access_token, meta_test_event_code, updated_at')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('settings GET error:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }

  // Pixel ID pode aparecer (vai pro <head> público mesmo).
  // Access token e test_event_code nunca retornam em texto plano: enviamos apenas se já existe (boolean).
  return NextResponse.json({
    meta_pixel_id: data?.meta_pixel_id ?? '',
    meta_access_token: data?.meta_access_token ? MASK : '',
    meta_test_event_code: data?.meta_test_event_code ?? '',
    has_access_token: !!data?.meta_access_token,
    updated_at: data?.updated_at ?? null,
  })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  let body: {
    meta_pixel_id?: string
    meta_access_token?: string
    meta_test_event_code?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const update: Record<string, string | null> = {}

  if (typeof body.meta_pixel_id === 'string') {
    const v = body.meta_pixel_id.trim()
    update.meta_pixel_id = v.length ? v : null
  }
  if (typeof body.meta_test_event_code === 'string') {
    const v = body.meta_test_event_code.trim()
    update.meta_test_event_code = v.length ? v : null
  }
  // Só sobrescreve token se vier valor não-mascarado
  if (typeof body.meta_access_token === 'string' && body.meta_access_token !== MASK) {
    const v = body.meta_access_token.trim()
    update.meta_access_token = v.length ? v : null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: true, noop: true })
  }

  const { error } = await supabaseAdmin
    .from('app_settings')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) {
    console.error('settings POST error:', error)
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 })
  }

  invalidateMetaSettingsCache()
  return NextResponse.json({ success: true })
}
