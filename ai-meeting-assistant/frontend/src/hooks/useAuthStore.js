import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: async (email, password) => {
        const form = new FormData()
        form.append('username', email)
        form.append('password', password)
        const { data } = await axios.post('/api/auth/login', form)
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
        const me = await axios.get('/api/auth/me')
        set({ token: data.access_token, user: me.data })
      },
      register: async (email, password, full_name) => {
        await axios.post('/api/auth/register', { email, password, full_name })
      },
      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        set({ token: null, user: null })
      },
      hydrate: () => {
        const token = get().token
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },
    }),
    { name: 'auth' }
  )
)
