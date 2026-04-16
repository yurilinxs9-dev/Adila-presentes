import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Client-side (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side (service role - bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Lead = {
  id: string
  nome_completo: string
  celular: string
  created_at: string
  ip_address: string | null
  user_agent: string | null
}
