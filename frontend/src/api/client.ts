/**
 * Configured Axios instance.
 * Base URL comes from env — in development Vite proxy forwards /api → localhost:8000
 * In production, set VITE_API_URL to your deployed backend.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

// Response interceptor — log errors in development
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.status, error.response?.data ?? error.message)
    }
    return Promise.reject(error)
  }
)
