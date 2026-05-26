import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// useMyQuotes — eigen offertes via RLS (prospect_email = auth.email()).
export function useMyQuotes() {
  return useQuery({
    queryKey: ['my-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_quotes')
        .select(`
          id, status, package, monthly_price, scope_items, rationale,
          created_at, sent_at, reviewed_at,
          session:discovery_sessions(prospect_company, prospect_name, prospect_email, scraped_url)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useMyQuote(id) {
  return useQuery({
    queryKey: ['my-quotes', 'detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_quotes')
        .select('*, session:discovery_sessions(*)')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useMyContracts() {
  return useQuery({
    queryKey: ['my-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, status, client_company, client_name, signature_token, sent_at, signed_at, signer_name, created_at, contract_terms')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useMyContract(id) {
  return useQuery({
    queryKey: ['my-contracts', 'detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useMyInvoices() {
  return useQuery({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_invoices')
        .select('id, invoice_number, status, total, subtotal, tax_amount, invoice_date, due_date, paid_at, sent_at, client_company, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useMyInvoice(id) {
  return useQuery({
    queryKey: ['my-invoices', 'detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_invoices')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useMyDiscoverySessions() {
  return useQuery({
    queryKey: ['my-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_sessions')
        .select('id, consent_token, status, prospect_company, scraped_url, created_at, completed_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}
