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
const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const tenants = TENANTS // SEAM: later list_tenants() uit het brein
  const isLoading = false

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
    () => ({ tenants, activeTenantId, activeTenant, switchTenant, isLoading }),
    [tenants, activeTenantId, activeTenant, switchTenant, isLoading],
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
