/* SettingsPage — /settings: de Beheer-pagina uit de Claude Design-blauwdruk
   (dashboard/shell.jsx · SettingsPage). 'settings' is core (altijd aan). De
   module-flags leven in de design-laag (store.jsx loadFlags/saveFlags); de
   live board-/sidebar-gate loopt via de tenant-config (AppShell). */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsPage as SettingsView } from '../design/settings.jsx'
import { loadFlags, saveFlags } from '../design/store.jsx'

export default function SettingsPage() {
  const navigate = useNavigate()
  const go = (id) => navigate(id === 'dashboard' ? '/' : '/' + id)
  const [flags, setFlags] = useState(loadFlags)
  const setFlag = useCallback((id, val) => {
    setFlags((f) => { const n = { ...f, [id]: val }; saveFlags(n); return n })
  }, [])

  return <SettingsView flags={flags} setFlag={setFlag} go={go} />
}
