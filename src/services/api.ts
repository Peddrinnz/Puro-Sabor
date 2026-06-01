import axios from 'axios'

const API_BASE = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
})

export function getImageUrl(image?: string | null): string {
  if (!image) return ''
  if (typeof image !== 'string') return ''
  const trimmed = image.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http') || trimmed.startsWith('data:')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/uploads/${trimmed}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('puro_sabor_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
