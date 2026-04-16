// Global Meta Pixel typing for client-side fbq calls.
// Assinatura minimal — só o que usamos.
declare global {
  interface Window {
    fbq?: (
      command: 'init' | 'track' | 'trackCustom' | 'trackSingle' | 'trackSingleCustom',
      eventNameOrPixelId: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void
  }
}

export {}
