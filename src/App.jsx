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
import ReturnManagementPage from './pages/ReturnManagementPage'
import OfflineManagementPage from './pages/OfflineManagement'
import OfflineDataPage from './pages/OfflineDataPage'
import TaskDataPage from './pages/Task/TaskDataPage'
import TaskCreationANdManagement from './pages/Task/TaskCreationANdManagement'
import SubTaskManagement from './pages/Task/SubTaskManagement'
import SubmissionManagement from './pages/Task/SubmissionManagement'

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
          duration: 6000, // Hold toaster for 6 seconds (default is usually 4s)
          style: {
            background: '#fffbef',
            color: '#141629',
            border: '3px solid #f58021',
            borderRadius: '20px',
            fontSize: '24px',
            fontWeight: '700',
            boxShadow: '0 6px 32px 0 rgba(245,128,33,0.25), 0 1.5px 6px 0 rgba(20,22,41,0.14)',
            fontFamily: 'Sora, sans-serif',
            letterSpacing: '0.025em',
            padding: '26px 40px',
            textTransform: 'uppercase',
            textAlign: 'center',
            zIndex: 99999,
          },
          success: { 
            duration: 6000, // Hold success toaster for 6 seconds
            iconTheme: { primary: '#10b981', secondary: '#fff4e2' }
          },
          error: { 
            duration: 9000, // Hold error toaster for 9 seconds (error may be read slower by users)
            iconTheme: { primary: '#ef4444', secondary: '#fff4e2' }
          },
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
          <Route path="return-management" element={<ReturnManagementPage />} />
          <Route path="offline-management" element={<OfflineManagementPage />} />
          <Route path="handler-dashboard" element={<>
            <div>
              Handler Dashboard
            </div>
          </>} />

          <Route path="task" element={<TaskCreationANdManagement />} />
          <Route path="sub-task" element={<SubTaskManagement />} />
          <Route path="sub-task-submission" element={<SubmissionManagement />} />


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
            path="offline-data"
            element={
              <AdminRoute>
                <OfflineDataPage />
              </AdminRoute>
            }
          />
              <Route
            path="task-data"
            element={
              <AdminRoute>
                <TaskDataPage />
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
