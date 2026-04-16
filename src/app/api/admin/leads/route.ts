import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/sessions'

const PER_PAGE = 20

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !isValidToken(token)) {
      return NextResponse.json(
        { error: 'Nao autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const search = searchParams.get('search')?.trim() || ''
    const from = (page - 1) * PER_PAGE
    const to = from + PER_PAGE - 1

    let query = supabaseAdmin
      .from('leads_live_ofertas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`nome_completo.ilike.%${search}%,celular.ilike.%${search}%`)
    }

    const { data: leads, count: total, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar leads' },
        { status: 500 }
      )
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    const { count: today_count } = await supabaseAdmin
      .from('leads_live_ofertas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)

    const { count: last24h_count } = await supabaseAdmin
      .from('leads_live_ofertas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24h)

    const totalCount = total ?? 0
    const total_pages = Math.ceil(totalCount / PER_PAGE)

    return NextResponse.json({
      leads: leads ?? [],
      total: totalCount,
      today_count: today_count ?? 0,
      last24h_count: last24h_count ?? 0,
      page,
      total_pages,
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !isValidToken(token)) {
      return NextResponse.json(
        { error: 'Nao autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do lead é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('leads_live_ofertas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
