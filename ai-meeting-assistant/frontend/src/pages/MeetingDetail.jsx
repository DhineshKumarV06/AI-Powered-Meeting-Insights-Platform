import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Upload, Send, Loader2, ChevronDown, ChevronUp, ArrowLeft, CheckSquare, Lightbulb, FileText, Mail } from 'lucide-react'

export default function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState(null)
  const [summary, setSummary] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript, setTranscript] = useState('')
  const fileRef = useRef()
  const pollRef = useRef()

  const fetchMeeting = async () => {
    try {
      const { data } = await axios.get(`/api/meetings/${id}`)
      setMeeting(data)
      return data
    } catch { toast.error('Meeting not found'); navigate('/') }
  }

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get(`/api/summaries/${id}`)
      setSummary(data)
      return true
    } catch { return false }
  }

  useEffect(() => {
    fetchMeeting()
    fetchSummary()
  }, [id])

  useEffect(() => {
    if (meeting?.status === 'processing' || meeting?.status === 'recording') {
      pollRef.current = setInterval(async () => {
        const m = await fetchMeeting()
        if (m?.status === 'done') {
          clearInterval(pollRef.current)
          fetchSummary()
          toast.success('Summary ready!')
        } else if (m?.status === 'failed') {
          clearInterval(pollRef.current)
          toast.error('Processing failed')
        }
      }, 4000)
    }
    return () => clearInterval(pollRef.current)
  }, [meeting?.status])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      await axios.post(`/api/recordings/${id}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Uploaded! Processing started...')
      fetchMeeting()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSendEmail = async () => {
    const emails = emailInput.split(',').map(e => e.trim()).filter(Boolean)
    if (!emails.length) { toast.error('Enter at least one email'); return }
    setSending(true)
    try {
      await axios.post(`/api/summaries/${id}/send-email`, { recipients: emails })
      toast.success('Email sent!')
      setEmailInput('')
    } catch { toast.error('Failed to send email') }
    finally { setSending(false) }
  }

  if (!meeting) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={28} /></div>

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5">
        <ArrowLeft size={15} /> Back to meetings
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{meeting.title}</h1>
            {meeting.description && <p className="text-slate-500 text-sm mt-1">{meeting.description}</p>}
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            meeting.status === 'done' ? 'bg-green-50 text-green-700' :
            meeting.status === 'processing' ? 'bg-amber-50 text-amber-700' :
            meeting.status === 'failed' ? 'bg-red-50 text-red-700' :
            'bg-slate-100 text-slate-500'
          }`}>{meeting.status}</span>
        </div>

        {(meeting.status === 'pending') && (
          <div className="mt-5 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
            <Upload size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium mb-1">Upload meeting recording</p>
            <p className="text-xs text-slate-400 mb-4">MP3, MP4, WAV, M4A, WebM — max 25MB</p>
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 mx-auto">
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Choose File</>}
            </button>
            <input ref={fileRef} type="file" accept=".mp3,.mp4,.wav,.m4a,.webm,.ogg" className="hidden" onChange={handleUpload} />
          </div>
        )}

        {(meeting.status === 'processing' || meeting.status === 'recording') && (
          <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Processing your recording...</p>
              <p className="text-sm text-amber-600 mt-0.5">Transcribing with Whisper + generating summary with GPT-4. This may take a minute.</p>
            </div>
          </div>
        )}
      </div>

      {summary && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={17} className="text-brand-500" />
              <h2 className="font-semibold text-slate-700">Overview</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{summary.overview}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={17} className="text-amber-500" />
              <h2 className="font-semibold text-slate-700">Key Decisions</h2>
            </div>
            <ul className="space-y-2">
              {summary.key_decisions?.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare size={17} className="text-green-500" />
              <h2 className="font-semibold text-slate-700">Action Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium">Task</th>
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium">Owner</th>
                    <th className="text-left py-2 text-slate-500 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.action_items?.map((a, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2.5 pr-4 text-slate-700">{a.task}</td>
                      <td className="py-2.5 pr-4 text-slate-500">{a.owner || '—'}</td>
                      <td className="py-2.5 text-slate-500">{a.due_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={17} className="text-blue-500" />
              <h2 className="font-semibold text-slate-700">Send Email Summary</h2>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="email1@co.com, email2@co.com"
                value={emailInput} onChange={e => setEmailInput(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button onClick={handleSendEmail} disabled={sending}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 flex-shrink-0">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
