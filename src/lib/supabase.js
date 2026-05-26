import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
}

// Wijst naar Brain Supabase (ajcckxxlkvdnpwdfvmvk) waar discovery_quotes,
// contracts, discovery_invoices wonen. RLS-policy horaizon-042 filtert per
// klant via auth.email() match op prospect_email / client_email.
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
