'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Download,
  Copy,
  ExternalLink,
  LogOut,
  Users,
  Calendar,
  Clock,
  Trash2,
  Settings as SettingsIcon,
  LayoutDashboard,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Zap,
} from 'lucide-react'

type Lead = {
  id: string
  nome_completo: string
  celular: string
  created_at: string
  ip_address: string | null
  user_agent: string | null
}

type DashboardData = {
  leads: Lead[]
  total: number
  today_count: number
  last24h_count: number
  page: number
  total_pages: number
}

type Tab = 'leads' | 'settings'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('leads')

  const [data, setData] = useState<DashboardData | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Configurações (Pixel / CAPI)
  const [settings, setSettings] = useState({
    meta_pixel_id: '',
    meta_access_token: '',
    meta_test_event_code: '',
  })
  const [hasToken, setHasToken] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [settingsStatus, setSettingsStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle')
  const [settingsMsg, setSettingsMsg] = useState('')

  // Teste de conexão CAPI
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'err'>('idle')
  const [testMsg, setTestMsg] = useState('')
  const [testDetail, setTestDetail] = useState<string>('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/admin/leads?${params}`)
      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      const json = await res.json()
      setData(json)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    if (isLoggedIn) fetchLeads()
  }, [isLoggedIn, fetchLeads])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      if (!res.ok) return
      const json = await res.json()
      setSettings({
        meta_pixel_id: json.meta_pixel_id ?? '',
        meta_access_token: json.meta_access_token ?? '',
        meta_test_event_code: json.meta_test_event_code ?? '',
      })
      setHasToken(!!json.has_access_token)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn && tab === 'settings') fetchSettings()
  }, [isLoggedIn, tab, fetchSettings])

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSettingsStatus('saving')
    setSettingsMsg('')
    try {
      const payload: Record<string, string> = {
        meta_pixel_id: settings.meta_pixel_id,
        meta_test_event_code: settings.meta_test_event_code,
      }
      // Só envia o token se foi alterado (não é a máscara)
      if (settings.meta_access_token && !settings.meta_access_token.startsWith('•')) {
        payload.meta_access_token = settings.meta_access_token
      }
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Erro ao salvar')
      }
      setSettingsStatus('ok')
      setSettingsMsg('Configurações salvas com sucesso')
      fetchSettings()
      setTimeout(() => setSettingsStatus('idle'), 2500)
    } catch (err) {
      setSettingsStatus('err')
      setSettingsMsg(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  async function handleTestCapi() {
    setTestStatus('testing')
    setTestMsg('')
    setTestDetail('')
    try {
      const res = await fetch('/api/admin/test-capi', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      if (res.ok && json?.ok) {
        setTestStatus('ok')
        const fbtrace = json?.response?.fbtrace_id ? ` · trace: ${json.response.fbtrace_id}` : ''
        const received = typeof json?.response?.events_received === 'number' ? ` · events_received=${json.response.events_received}` : ''
        setTestMsg(
          json.usedTestCode
            ? 'Conexão OK. Evento enviado com test_event_code — confira na aba "Testar eventos" do Gerenciador de Eventos.'
            : 'Conexão OK. Evento de teste aceito pela Meta.'
        )
        setTestDetail(`HTTP ${json.status}${received}${fbtrace}`)
      } else {
        setTestStatus('err')
        const reason = json?.reason as string | undefined
        const hint =
          reason === 'missing_pixel'
            ? 'Salve um Meta Pixel ID antes de testar.'
            : reason === 'missing_token'
            ? 'Salve um Access Token antes de testar.'
            : reason === 'meta_error'
            ? 'Meta rejeitou o evento — token ou pixel inválido/sem permissão.'
            : reason === 'network'
            ? 'Falha de rede ao chamar a Graph API.'
            : 'Erro desconhecido.'
        setTestMsg(hint)
        setTestDetail(
          json?.error
            ? `${json.error}${json?.response?.error?.code ? ` (code ${json.response.error.code})` : ''}`
            : ''
        )
      }
    } catch (e) {
      setTestStatus('err')
      setTestMsg('Falha ao chamar o endpoint de teste.')
      setTestDetail(e instanceof Error ? e.message : '')
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setIsLoggedIn(true)
        setPassword('')
      } else {
        setLoginError('Senha incorreta')
      }
    } catch {
      setLoginError('Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsLoggedIn(false)
    setData(null)
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Deletar o lead "${nome}"?`)) return
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        setIsLoggedIn(false)
        return
      }
      if (res.ok) fetchLeads()
    } catch {
      // silently fail
    }
  }

  function exportCSV() {
    if (!data?.leads.length) return
    const headers = ['Nome Completo', 'Celular', 'Data/Hora', 'IP', 'User Agent']
    const rows = data.leads.map((l) => [
      l.nome_completo,
      l.celular,
      new Date(l.created_at).toLocaleString('pt-BR'),
      l.ip_address ?? '',
      l.user_agent ?? '',
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function cleanPhone(phone: string) {
    return phone.replace(/\D/g, '')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl"
        >
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Painel Admin
          </h1>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D41920] mb-4"
          />
          {loginError && (
            <p className="text-red-400 text-sm mb-4 text-center">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#D41920] text-white font-semibold hover:bg-[#b5151b] transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Painel Admin</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10">
        <button
          onClick={() => setTab('leads')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'leads'
              ? 'border-[#D41920] text-white'
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <LayoutDashboard size={16} />
          Leads
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'settings'
              ? 'border-[#D41920] text-white'
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <SettingsIcon size={16} />
          Configurações
        </button>
      </div>

      {tab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="max-w-2xl p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-5"
        >
          <div>
            <h2 className="text-lg font-semibold mb-1">Meta Pixel & Conversions API</h2>
            <p className="text-white/50 text-sm">
              Estes campos NÃO são exibidos publicamente. O Pixel é injetado no &lt;head&gt; e o
              token só é usado pelo servidor.
            </p>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1.5">Meta Pixel ID</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="ex.: 1234567890123456"
              value={settings.meta_pixel_id}
              onChange={(e) =>
                setSettings((s) => ({ ...s, meta_pixel_id: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D41920]"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1.5">
              Access Token (Conversions API){' '}
              {hasToken && (
                <span className="text-green-400 text-xs">(salvo)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                autoComplete="off"
                placeholder={hasToken ? 'Deixe em branco para manter o atual' : 'EAAB...'}
                value={settings.meta_access_token}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, meta_access_token: e.target.value }))
                }
                onFocus={(e) => {
                  // Limpa a máscara quando o usuário foca pra editar
                  if (e.target.value.startsWith('•')) {
                    setSettings((s) => ({ ...s, meta_access_token: '' }))
                  }
                }}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D41920] font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-white/40 text-xs mt-1.5">
              Gere em: Meta Events Manager → Configurações → Conversions API → Gerar token
            </p>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1.5">
              Test Event Code <span className="text-white/40">(opcional)</span>
            </label>
            <input
              type="text"
              autoComplete="off"
              placeholder="TEST12345"
              value={settings.meta_test_event_code}
              onChange={(e) =>
                setSettings((s) => ({ ...s, meta_test_event_code: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D41920]"
            />
            <p className="text-white/40 text-xs mt-1.5">
              Use durante testes para os eventos aparecerem na aba &quot;Eventos de Teste&quot;.
              Remova em produção.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={settingsStatus === 'saving'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D41920] text-white font-semibold hover:bg-[#b5151b] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {settingsStatus === 'saving' ? 'Salvando...' : 'Salvar configurações'}
            </button>
            <button
              type="button"
              onClick={handleTestCapi}
              disabled={testStatus === 'testing' || !hasToken}
              title={!hasToken ? 'Salve um Access Token antes de testar' : 'Envia um evento Lead de teste para a Meta'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap size={16} />
              {testStatus === 'testing' ? 'Testando...' : 'Testar conexão CAPI'}
            </button>
            {settingsStatus === 'ok' && (
              <span className="text-green-400 text-sm">{settingsMsg}</span>
            )}
            {settingsStatus === 'err' && (
              <span className="text-red-400 text-sm">{settingsMsg}</span>
            )}
          </div>

          {(testStatus === 'ok' || testStatus === 'err') && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                testStatus === 'ok'
                  ? 'border-green-500/30 bg-green-500/10 text-green-300'
                  : 'border-red-500/30 bg-red-500/10 text-red-300'
              }`}
            >
              <p className="font-medium">{testMsg}</p>
              {testDetail && (
                <p className="mt-1 text-xs opacity-80 font-mono break-all">{testDetail}</p>
              )}
            </div>
          )}
        </form>
      )}

      {tab === 'leads' && (
        <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-[#D41920]" />
            <span className="text-white/60 text-sm">Total de Leads</span>
          </div>
          <p className="text-3xl font-bold">{data?.total ?? 0}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-[#6B3FA0]" />
            <span className="text-white/60 text-sm">Leads Hoje</span>
          </div>
          <p className="text-3xl font-bold">{data?.today_count ?? 0}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-[#D41920]" />
            <span className="text-white/60 text-sm">Ultimas 24h</span>
          </div>
          <p className="text-3xl font-bold">{data?.last24h_count ?? 0}</p>
        </div>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Buscar por nome ou celular..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D41920]"
          />
        </div>
        <button
          onClick={fetchLeads}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50"
          title="Atualizar lista"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#6B3FA0] text-white font-semibold hover:bg-[#5a3488] transition-colors"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Nome</th>
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Celular</th>
              <th className="px-4 py-3 text-white/60 text-sm font-medium hidden md:table-cell">
                Data/Hora
              </th>
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {data?.leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-sm">{lead.nome_completo}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{lead.celular}</span>
                    <button
                      onClick={() => copyToClipboard(lead.celular, lead.id)}
                      className="text-white/40 hover:text-white transition-colors"
                      title="Copiar"
                    >
                      <Copy size={14} />
                    </button>
                    {copiedId === lead.id && (
                      <span className="text-xs text-green-400">Copiado!</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-white/60 hidden md:table-cell">
                  {formatDate(lead.created_at)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${cleanPhone(lead.celular)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors text-xs font-medium"
                    >
                      <ExternalLink size={12} />
                      WhatsApp
                    </a>
                    <button
                      onClick={() => handleDelete(lead.id, lead.nome_completo)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors text-xs font-medium"
                      title="Deletar lead"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data?.leads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                  Nenhum lead encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-white/60 text-sm">
            Pagina {data.page} de {data.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
            disabled={page >= data.total_pages}
            className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Proximo
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center mt-6">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[#D41920] rounded-full animate-spin" />
        </div>
      )}
        </>
      )}
    </div>
  )
}
