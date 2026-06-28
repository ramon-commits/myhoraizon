import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from './contexts/AuthContext'
import { TenantProvider } from './tenant/TenantProvider'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import PlaceholderPage from './components/PlaceholderPage'
import { KYANO } from './design/data'

// Placeholder-routes voor elke blauwdruk-module die nog geen echte pagina heeft,
// plus de losse views (iris, settings, vandaag, ...). De sidebar navigeert naar
// '/{id}'; deze routes vangen ze op tot de module gebouwd is.
const REAL_PAGES = new Set(['offertes', 'contracten', 'facturen', 'vandaag', 'postvak', 'sales', 'pipeline', 'crm'])
const PLACEHOLDER_ROUTES = [
  ...KYANO.modules.map((m) => ({ id: m.id, label: m.name })),
  { id: 'iris', label: 'Iris' },
  { id: 'settings', label: 'Beheer' },
].filter((r) => !REAL_PAGES.has(r.id))

import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import DesignCheckPage from './pages/DesignCheckPage'
import VandaagPage from './pages/VandaagPage'
import InboxPage from './pages/InboxPage'
import SalesPage from './pages/SalesPage'
import PipelinePage from './pages/PipelinePage'
import CrmPage from './pages/CrmPage'
import DashboardPage from './pages/DashboardPage'
import QuotesListPage from './pages/QuotesListPage'
import QuoteDetailPage from './pages/QuoteDetailPage'
import ContractsListPage from './pages/ContractsListPage'
import ContractDetailPage from './pages/ContractDetailPage'
import InvoicesListPage from './pages/InvoicesListPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {import.meta.env.DEV && <Route path="/_design" element={<DesignCheckPage />} />}

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="vandaag" element={<VandaagPage />} />
              <Route path="postvak" element={<InboxPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="pipeline" element={<PipelinePage />} />
              <Route path="crm" element={<CrmPage />} />
              <Route path="offertes" element={<QuotesListPage />} />
              <Route path="offertes/:id" element={<QuoteDetailPage />} />
              <Route path="contracten" element={<ContractsListPage />} />
              <Route path="contracten/:id" element={<ContractDetailPage />} />
              <Route path="facturen" element={<InvoicesListPage />} />
              <Route path="facturen/:id" element={<InvoiceDetailPage />} />

              {PLACEHOLDER_ROUTES.map((r) => (
                <Route
                  key={r.id}
                  path={r.id}
                  element={<PlaceholderPage title={r.label} />}
                />
              ))}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
