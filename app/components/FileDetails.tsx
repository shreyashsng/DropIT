'use client'
import { useState, useCallback, useMemo } from 'react'
import { debounce } from 'lodash'

interface FileDetailsProps {
  fileUrl: string
}

export function FileDetails({ fileUrl }: FileDetailsProps) {
  const [username, setUsername] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleTelegramSend = useCallback(async () => {
    if (!username) return

    setIsSending(true)
    setSendStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, fileUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSendStatus('success')
      setUsername('')
    } catch (error) {
      setSendStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }, [username, fileUrl])

  const handleUsernameChange = useMemo(
    () => debounce((value: string) => setUsername(value), 300),
    []
  )

  const isButtonDisabled = useMemo(() => 
    isSending || !username, 
    [isSending, username]
  )

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
        File Ready to Share!
      </h2>

      <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8 ring-1 ring-gray-900/5">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.13-.02.2z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share via Telegram
          </h3>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            defaultValue={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="Enter Telegram username (e.g., @username)"
            className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={handleTelegramSend}
            disabled={isButtonDisabled}
            className={`w-full px-4 py-3 rounded-xl transition-all ${
              isButtonDisabled
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {isSending ? 'Sending...' : 'Send Link'}
          </button>
        </div>

        {sendStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
            Message sent successfully! Check your Telegram.
          </div>
        )}
        {sendStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}
      </div>
      
      <div className="text-center space-y-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ⏰ This file will be automatically deleted at midnight
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          Open File
        </a>
      </div>
    </div>
  )
} 