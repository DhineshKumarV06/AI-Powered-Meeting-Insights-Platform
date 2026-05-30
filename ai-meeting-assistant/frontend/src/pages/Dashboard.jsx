import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Mic, Clock, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react'

const STATUS_ICON = {
  pending: <Clock size={14} className="text-slate-400" />,
  recording: <Mic size={14} className="text-blue-500 animate-pulse" />,
  processing: <Loader2 size={14} className="text-amber-500 animate-spin" />,
  done: <CheckCircle size={14} className="text-green-500" />,
  failed: <AlertCircle size={14} className="text-red-500" />,
}

const STATUS_LABEL = {
  pending: 'Pending', recording: 'Uploaded', processing: 'Processing...', done: 'Ready', failed: 'Failed',
}

export default function Dashboard() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchMeetings = async () => {
    try {
      const { data } = await axios.get('/api/meetings/')
      setMeetings(data)
    } catch { toast.error('Failed to load meetings') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMeetings() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      await axios.post('/api/meetings/', { title, description })
      toast.success('Meeting created!')
      setTitle(''); setDescription(''); setShowForm(false)
      fetchMeetings()
    } catch { toast.error('Failed to create meeting') }
    finally { setCreating(false) }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Delete this meeting?')) return
    try {
      await axios.delete(`/api/meetings/${id}`)
      toast.success('Deleted')
      setMeetings(m => m.filter(x => x.id !== id))
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Meetings</h1>
          <p className="text-slate-500 text-sm mt-1">Record, transcribe and summarize with AI</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Meeting
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-4">Create New Meeting</h2>
          <input type="text" placeholder="Meeting title *" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}
            rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
              {creating && <Loader2 size={14} className="animate-spin" />} Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={20} /> Loading...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Mic size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No meetings yet</p>
          <p className="text-sm mt-1">Create your first meeting to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(m => (
            <Link key={m.id} to={`/meetings/${m.id}`}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-brand-300 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
                  {STATUS_ICON[m.status]}{STATUS_LABEL[m.status]}
                </div>
                <div>
                  <p className="font-medium text-slate-800 group-hover:text-brand-600">{m.title}</p>
                  {m.description && <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span>
                <button onClick={(e) => handleDelete(m.id, e)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={15} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
