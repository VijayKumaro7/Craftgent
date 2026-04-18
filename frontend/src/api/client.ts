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

let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await apiClient.post('/api/auth/refresh')
        const newToken = data.access_token
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        pendingRequests.forEach((cb) => cb(newToken))
        pendingRequests = []
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        pendingRequests = []
        delete apiClient.defaults.headers.common['Authorization']
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.status)
    }
    return Promise.reject(error)
  }
)
