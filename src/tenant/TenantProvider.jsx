/* ============================================================
   TenantProvider — interface EXACT als horaizon-brain:
     { tenants, activeTenantId, activeTenant, switchTenant, isLoading }
   activeTenantId in localStorage onder 'kyano:active-tenant-id'.
   null = CEO-allesweergave (ziet alles, geen gate).

   SEAM: `tenants` komt nu uit tenants.js (demo). Later wordt dit de
   customer-flow list_tenants uit het brein; de interface blijft identiek.
   ============================================================ */
import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { TENANTS } from './tenants'
import { MODULE_BY_KEY } from './modules'

const LS_KEY = 'kyano:active-tenant-id'
const LS_TENANTS = 'kyano:tenants.v1' // door het Kyano-beheer bewerkte tenant-config
const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const isLoading = false

  // SEAM: start uit tenants.js (demo); het Kyano-beheer-dashboard bewerkt deze
  // config (custom_modules/active_agents/…) en die wijziging is meteen de gate
  // voor die klant. Later vervangt list_tenants() uit het brein de seed.
  const [tenants, setTenants] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(LS_TENANTS)); if (Array.isArray(s) && s.length) return s } catch { /* geen storage */ }
    return TENANTS
  })
  const persist = useCallback((updater) => {
    setTenants((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try { localStorage.setItem(LS_TENANTS, JSON.stringify(next)) } catch { /* geen storage */ }
      return next
    })
  }, [])
  const updateTenant = useCallback((id, patch) => persist((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))), [persist])
  const addTenant = useCallback((t) => persist((prev) => [t, ...prev]), [persist])
  const removeTenant = useCallback((id) => persist((prev) => prev.filter((t) => t.id !== id)), [persist])

  const [activeTenantId, setActiveTenantId] = useState(() => {
    try { return localStorage.getItem(LS_KEY) || null } catch { return null }
  })

  const switchTenant = useCallback((id) => {
    const next = id || null
    setActiveTenantId(next)
    try { next ? localStorage.setItem(LS_KEY, next) : localStorage.removeItem(LS_KEY) } catch { /* geen storage */ }
  }, [])

  const activeTenant = useMemo(
    () => (activeTenantId ? tenants.find((t) => t.id === activeTenantId) || null : null),
    [activeTenantId, tenants],
  )

  const value = useMemo(
    () => ({ tenants, activeTenantId, activeTenant, switchTenant, updateTenant, addTenant, removeTenant, isLoading }),
    [tenants, activeTenantId, activeTenant, switchTenant, updateTenant, addTenant, removeTenant, isLoading],
  )
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant moet binnen TenantProvider')
  return ctx
}

/* Module-instellingen-overlay voor de actieve tenant. CEO (null) → enabled,
   lege settings. SEAM: brein vult `settings` later per module. */
// eslint-disable-next-line react-refresh/only-export-components
export function useModuleSettings(moduleKey) {
  const { activeTenant } = useTenant()
  if (!activeTenant) return { enabled: true, settings: {} }
  const ms = (activeTenant.module_settings || {})[moduleKey]
  if (ms) return { enabled: ms.enabled !== false, settings: ms.settings || {} }
  // geen overlay → core blijft aan, onbekende custom uit.
  const mod = MODULE_BY_KEY[moduleKey]
  return { enabled: mod ? mod.kind === 'core' : false, settings: {} }
}
