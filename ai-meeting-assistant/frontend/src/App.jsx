import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './hooks/useAuthStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MeetingDetail from './pages/MeetingDetail'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="meetings/:id" element={<MeetingDetail />} />
      </Route>
    </Routes>
  )
}
