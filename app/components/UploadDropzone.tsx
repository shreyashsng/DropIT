'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadDropzoneProps {
  isUploading: boolean
  setIsUploading: (value: boolean) => void
  setFileUrl: (url: string | null) => void
}

export function UploadDropzone({ isUploading, setIsUploading, setFileUrl }: UploadDropzoneProps) {
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('File size must be less than 100MB')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFileUrl(data.url)
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [setFileUrl, setIsUploading])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600'
          }
          ${isUploading 
            ? 'pointer-events-none opacity-50' 
            : 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          {isUploading ? (
            <>
              <div className="w-16 h-16 mb-4 relative">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 dark:border-blue-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Uploading your file...</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <svg 
                  className={`w-16 h-16 ${
                    isDragActive ? 'text-blue-500' : 'text-gray-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-200 font-medium mb-1">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
            </>
          )}
        </div>
      </div>
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-center">{uploadError}</p>
        </div>
      )}
    </div>
  )
} 