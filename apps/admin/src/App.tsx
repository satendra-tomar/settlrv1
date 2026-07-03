import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { RequireAdmin } from './components/RequireAdmin'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ListingsPage } from './pages/ListingsPage'
import { ListingFormPage } from './pages/ListingFormPage'
import { LeadsPage } from './pages/LeadsPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { CitiesPage } from './pages/CitiesPage'
import { AmenitiesPage } from './pages/AmenitiesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin-protected routes using Layout with Outlet */}
          <Route
            element={
              <RequireAdmin>
                <Layout />
              </RequireAdmin>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="listings" element={<ListingsPage />} />
            <Route path="listings/new" element={<ListingFormPage />} />
            <Route path="listings/:id/edit" element={<ListingFormPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="cities" element={<CitiesPage />} />
            <Route path="amenities" element={<AmenitiesPage />} />
          </Route>

          {/* Catch-all → Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
