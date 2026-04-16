import { NextRequest, NextResponse } from 'next/server'
import { isValidToken } from '@/lib/sessions'
import { testCapiConnection } from '@/lib/meta'

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  return !!token && isValidToken(token)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const result = await testCapiConnection()
  const httpStatus = result.ok ? 200 : 400
  return NextResponse.json(result, { status: httpStatus })
}
