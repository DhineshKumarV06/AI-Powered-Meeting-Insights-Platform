import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { Mic, Loader2 } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(email, password, fullName)
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch {
      toast.error('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl mb-6">
          <Mic size={24} /> MeetingAI
        </div>
        <h1 className="text-lg font-bold text-slate-800 mb-1">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">Start managing your meetings</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />} Create Account
          </button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-5">
          Have an account? <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
