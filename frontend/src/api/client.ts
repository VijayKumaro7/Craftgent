/**
 * Configured Axios instance.
 * Base URL comes from env — in development Vite proxy forwards /api → localhost:8000.
 * In production, set VITE_API_URL to your deployed backend.
 *
 * Auth: attaches the current Supabase session token as a Bearer header on
 * every request. Token refresh is handled automatically by the Supabase SDK.
 */
import axios from 'axios'
import { supabase } from '@/lib/supabase'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10_000,
})

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    // With no backend configured, SPA hosting rewrites /api/* to index.html
    // with a 200 — treat HTML (or any non-JSON) payloads as errors so callers
    // hit their error paths instead of rendering garbage data.
    const contentType = String(response.headers?.['content-type'] ?? '')
    if (contentType.includes('text/html') || typeof response.data === 'string') {
      return Promise.reject(new Error('Backend unavailable: received HTML instead of JSON'))
    }
    return response
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.status)
    }
    return Promise.reject(error)
  }
)
