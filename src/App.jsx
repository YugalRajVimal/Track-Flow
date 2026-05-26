import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AWBManagementPage from './pages/AWBManagementPage'
import AuditLogsPage from './pages/AuditLogsPage'
import UsersPage from './pages/UsersPage'
import ChannelPartnersPage from './pages/ChannelPartnersPage'
import BrandsPage from './pages/BrandsPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141629',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Sora, sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0a0b14' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0a0b14' } },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="awb-management" element={<AWBManagementPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route
            path="users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="channel-partners"
            element={
              <AdminRoute>
                <ChannelPartnersPage />
              </AdminRoute>
            }
          />
          <Route
            path="brands"
            element={
              <AdminRoute>
                <BrandsPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
