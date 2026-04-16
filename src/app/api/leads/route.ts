import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendCapiLead } from '@/lib/meta'

const BRAZILIAN_PHONE_REGEX = /^(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome_completo, celular } = body

    if (!nome_completo || typeof nome_completo !== 'string' || nome_completo.trim().length < 3) {
      return NextResponse.json(
        { error: 'nome_completo deve ter pelo menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (!celular || typeof celular !== 'string' || !BRAZILIAN_PHONE_REGEX.test(celular.trim())) {
      return NextResponse.json(
        { error: 'celular deve ser um numero de telefone brasileiro valido' },
        { status: 400 }
      )
    }

    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip_address = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
    const user_agent = request.headers.get('user-agent') || null

    const { error } = await supabaseAdmin.from('leads_live_ofertas').insert({
      nome_completo: nome_completo.trim(),
      celular: celular.trim(),
      ip_address,
      user_agent,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar lead' },
        { status: 500 }
      )
    }

    // Dispara evento "Lead" para a Meta Conversions API (server-side, não bloqueia resposta).
    const referer = request.headers.get('referer')
    const fbp = request.cookies.get('_fbp')?.value || null
    const fbc = request.cookies.get('_fbc')?.value || null
    sendCapiLead({
      nome_completo: nome_completo.trim(),
      celular: celular.trim(),
      ip: ip_address === 'unknown' ? null : ip_address,
      user_agent,
      event_source_url: referer,
      fbp,
      fbc,
    }).catch(() => {})

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
