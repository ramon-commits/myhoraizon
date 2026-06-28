/* ============================================================
   checkModuleAccess — toegangs-seam, brein-regel EXACT gespiegeld.

   Brein-regel:
     allowed = isCore(moduleKey) || tenant.custom_modules.includes(moduleKey)

   Output-vorm IDENTIEK aan de edge-fn 'check-route-access':
     { allowed: bool, reason: 'module_not_enabled'|'no_tenant_access'|null,
       module_kind: 'core'|'custom' }

   SEAM: NU lokaal tegen de tenant-config. LATER, achter USE_BRAIN, exact:
     supabase.functions.invoke('check-route-access', { body: { tenant_id, module_key } })
   met identieke input (tenant + module_key) en identieke output. De rest van de
   app verandert niet, alleen deze functie schakelt om.
   ============================================================ */
import { isCore, MODULE_BY_KEY } from './modules'

export const USE_BRAIN = false // zet later op true zodra de edge-fn live is

export function checkModuleAccess(tenant, moduleKey) {
  const mod = MODULE_BY_KEY[moduleKey]
  const module_kind = mod ? mod.kind : 'custom'

  // CEO-allesweergave (geen actieve tenant) → altijd toegang.
  if (!tenant) return { allowed: true, reason: null, module_kind }

  if (USE_BRAIN) {
    // LATER: identieke input/output via de edge-fn. Bewust nog niet bedraad.
    // const { data } = await supabase.functions.invoke('check-route-access',
    //   { body: { tenant_id: tenant.id, module_key: moduleKey } })
    // return data  // { allowed, reason, module_kind }
  }

  // Onbekende module-key zonder tenant-match → geen toegang.
  if (!mod) return { allowed: false, reason: 'no_tenant_access', module_kind }

  const allowed = isCore(moduleKey) || (tenant.custom_modules || []).includes(moduleKey)
  return {
    allowed,
    reason: allowed ? null : 'module_not_enabled',
    module_kind,
  }
}
