import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import { Mic, LogOut, User } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-lg">
          <Mic size={22} />
          MeetingAI
        </Link>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <User size={16} />
          <span>{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
