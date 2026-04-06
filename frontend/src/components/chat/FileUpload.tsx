/**
 * FileUpload — file upload component with drag-drop and preview
 */
import { useRef, useState } from 'react'
import { useFileUpload, type UploadedFile } from '@/hooks/useFileUpload'
import { UI_ICONS } from '@/constants/assets'

interface FileUploadProps {
  onFilesSelected?: (files: UploadedFile[]) => void
  maxFiles?: number
}

export function FileUpload({ onFilesSelected, maxFiles = 5 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, isUploading, error, clearError } = useFileUpload()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    await processFiles(files)
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || [])
    await processFiles(files)
  }

  const processFiles = async (files: File[]) => {
    if (selectedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    for (const file of files) {
      const uploaded = await uploadFile(file)
      if (uploaded) {
        setSelectedFiles(prev => [...prev, uploaded])
        onFilesSelected?.([...selectedFiles, uploaded])
      }
    }
  }

  const removeFile = (id: string) => {
    const updated = selectedFiles.filter(f => f.id !== id)
    setSelectedFiles(updated)
    onFilesSelected?.(updated)
  }

  const getFileIcon = (name: string): string => {
    // Use FILE icon for all file types (more consistent than emoji)
    return UI_ICONS.FILE
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drag-drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded p-2 cursor-pointer transition-colors ${
          isDragging
            ? 'border-white/60 bg-white/10'
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload files"
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full text-center py-1.5 font-terminal text-[11px] text-white/70 hover:text-white/90 disabled:opacity-40 flex items-center justify-center gap-1"
        >
          {isUploading ? (
            <>
              <img src={UI_ICONS.UPLOAD} alt="uploading" width={14} height={14} style={{ imageRendering: 'pixelated' }} />
              UPLOADING... {Math.round(100)}%
            </>
          ) : selectedFiles.length > 0 ? (
            <>
              <img src={UI_ICONS.UPLOAD} alt="attach" width={14} height={14} style={{ imageRendering: 'pixelated' }} />
              ATTACH MORE FILES
            </>
          ) : (
            <>
              <img src={UI_ICONS.UPLOAD} alt="drop" width={14} height={14} style={{ imageRendering: 'pixelated' }} />
              DROP FILES OR CLICK
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-1.5 bg-red-900/20 border border-red-500/30 rounded font-terminal text-[10px] text-red-300 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={clearError}
            className="text-white/60 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-1">
          {selectedFiles.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-1 p-1.5 bg-white/5 border border-white/10 rounded group hover:bg-white/8"
            >
              <img
                src={getFileIcon(file.name)}
                alt="file type"
                width={16}
                height={16}
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-terminal text-[10px] text-white/80 truncate">
                  {file.name}
                </div>
                <div className="font-terminal text-[8px] text-white/40">
                  {(file.size / 1024).toFixed(1)}KB
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="text-white/40 hover:text-white/70 opacity-0 group-hover:opacity-100 transition-opacity px-1"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
