import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import PlaceholderPage from './components/PlaceholderPage'
import { PLACEHOLDER_ITEMS } from './nav'

import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
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
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="offertes" element={<QuotesListPage />} />
              <Route path="offertes/:id" element={<QuoteDetailPage />} />
              <Route path="contracten" element={<ContractsListPage />} />
              <Route path="contracten/:id" element={<ContractDetailPage />} />
              <Route path="facturen" element={<InvoicesListPage />} />
              <Route path="facturen/:id" element={<InvoiceDetailPage />} />

              {PLACEHOLDER_ITEMS.map((it) => (
                <Route
                  key={it.to}
                  path={it.to.slice(1)}
                  element={<PlaceholderPage title={it.label} />}
                />
              ))}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
