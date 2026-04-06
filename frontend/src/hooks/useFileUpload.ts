/**
 * useFileUpload — handle file uploads with progress tracking
 */
import { useState, useCallback } from 'react'
import { apiClient } from '@/api/client'

// Must match backend ALLOWED_TYPES in files_router.py
const ALLOWED_TYPES = ['.pdf', '.csv', '.json', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.py', '.js', '.ts']
const MAX_SIZE = 50 * 1024 * 1024 // 50MB (matches backend limit)

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  token?: string
  url?: string
}

interface UseFileUploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useFileUpload() {
  const [state, setState] = useState<UseFileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  const validateFile = useCallback((file: File): string | null => {
    // Check file extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      return `File type not allowed. Supported: ${ALLOWED_TYPES.join(', ')}`
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return `File too large. Maximum: ${MAX_SIZE / 1024 / 1024}MB`
    }

    return null
  }, [])

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    // Validate
    const error = validateFile(file)
    if (error) {
      setState({ isUploading: false, progress: 0, error })
      return null
    }

    // Start upload
    setState({ isUploading: true, progress: 0, error: null })

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Note: apiClient might not support progress tracking
      // For now, we'll do a simple upload
      const response = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const uploadedFile: UploadedFile = {
        id: response.data.file_id,
        name: response.data.filename,
        size: response.data.file_size,
        type: response.data.file_type,
        token: response.data.file_id,
      }

      setState({ isUploading: false, progress: 100, error: null })
      return uploadedFile
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setState({ isUploading: false, progress: 0, error: errorMsg })
      return null
    }
  }, [validateFile])

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    uploadFile,
    clearError,
    validateFile,
  }
}
