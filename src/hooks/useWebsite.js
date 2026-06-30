/* useWebsite — React-hook rond de Website-databron-seam (src/lib/website.js).
   Levert de snapshot voor de actieve tenant. connected=false betekent: de
   echte Website-backend (horaizon-app op project dofmjstoeqpezukgqtyq) is nog
   niet naar het brein geport; de cijfers zijn dan een voorbeeld in de echte
   vorm. De UI toont dat expliciet. Zodra de port (F2.7-B4) klaar is, wordt
   connected=true zonder code-wijziging. */
import { useEffect, useState } from 'react'
import { useTenant } from '../tenant/TenantProvider'
import { fetchWebsiteSnapshot } from '../lib/website'

export function useWebsite() {
  const { activeTenant } = useTenant()
  const tenantId = activeTenant?.id || null
  const [state, setState] = useState({ loading: true, connected: false, source: 'seam', reason: null })

  useEffect(() => {
    let alive = true
    fetchWebsiteSnapshot({ tenant: activeTenant })
      .then((snap) => alive && setState({ loading: false, ...snap }))
      .catch((e) => alive && setState({ loading: false, connected: false, source: 'seam', reason: e?.message || 'fout' }))
    return () => { alive = false }
    // alleen opnieuw laden bij wisseling van tenant; activeTenant-object is stabiel per id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId])

  return state
}
