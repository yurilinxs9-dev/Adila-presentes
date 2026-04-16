import { getMetaSettings } from '@/lib/meta'

const PIXEL_SNIPPET = (id: string) =>
  `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`

export default async function MetaPixel() {
  const { pixel_id } = await getMetaSettings()
  if (!pixel_id) return null

  // Sanitização: apenas dígitos (Meta Pixel IDs são numéricos)
  const safeId = pixel_id.replace(/[^0-9]/g, '')
  if (!safeId) return null

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: PIXEL_SNIPPET(safeId) }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${safeId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
