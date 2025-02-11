'use client'
import { useState } from 'react'
import { UploadDropzone } from './components/UploadDropzone'
import { FileDetails } from './components/FileDetails'

export default function Home() {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block">
            <h1 className="flex items-center justify-center text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <svg className="w-12 h-12 mr-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              DropIT
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Secure, instant file sharing without the hassle.
            <br />
            <span className="text-sm">No login required. Files auto-delete at midnight.</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl p-8 mb-12 ring-1 ring-gray-900/5">
          {!fileUrl ? (
            <UploadDropzone
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              setFileUrl={setFileUrl}
            />
          ) : (
            <FileDetails fileUrl={fileUrl} />
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Quick & Easy"
            description="Drop files up to 100MB. No account needed."
            icon="upload"
          />
          <FeatureCard
            title="Secure Sharing"
            description="Private links with end-to-end delivery"
            icon="lock"
          />
          <FeatureCard
            title="Auto Cleanup"
            description="Files removed daily for your privacy"
            icon="clock"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { 
  title: string; 
  description: string; 
  icon: 'upload' | 'lock' | 'clock' 
}) {
  const icons = {
    upload: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    ),
    lock: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
    clock: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  }

  return (
    <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg ring-1 ring-gray-900/5 transition-transform hover:scale-105">
      <div className="text-blue-500 mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
} 