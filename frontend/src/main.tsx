/**
 * main.tsx — React DOM root.
 *
 * Providers (outer → inner):
 *   QueryClientProvider  — React Query for API calls
 *   StrictMode           — catches common bugs in development
 *   App                  — our root component
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus — not needed for an agent UI
      refetchOnWindowFocus: false,
      // Retry once on failure, then give up
      retry: 1,
      staleTime: 30_000,
    },
  },
})

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root element not found in index.html')

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
