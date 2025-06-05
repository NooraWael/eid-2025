"use client";

import { useParams } from 'next/navigation'  
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { EidSubmission } from '@/app/types'

const ViewSubmission = () => {  
  const params = useParams()  
  const name = params?.name as string  
  const [submission, setSubmission] = useState<EidSubmission | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (name && typeof name === 'string') {
      fetchSubmission(name)
    }
  }, [name])

  const fetchSubmission = async (submissionName: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('eid_submissions')
        .select('*')
        .eq('name', decodeURIComponent(submissionName))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (data) {
        setSubmission(data)
      } else {
        setError('Creation not found')
      }
    } catch (err) {
      console.error('Error fetching submission:', err)
      setError('Failed to load creation')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Background stars */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-4xl text-amber-400 opacity-30 animate-pulse">✨</div>
          <div className="absolute top-32 right-20 text-3xl text-amber-400 opacity-20 animate-pulse">⭐</div>
          <div className="absolute bottom-20 left-32 text-5xl text-amber-400 opacity-25 animate-pulse">🌙</div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="text-7xl mb-6 animate-bounce">🌙</div>
          <div className="text-3xl font-semibold text-amber-200 mb-2">Loading Creation...</div>
          <div className="text-amber-300">Preparing {name ? decodeURIComponent(name) : ''}'s greeting</div>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-6xl text-amber-400 opacity-10">✨</div>
          <div className="absolute top-20 right-20 text-4xl text-amber-400 opacity-15">🌙</div>
          <div className="absolute bottom-20 left-20 text-5xl text-amber-400 opacity-10">⭐</div>
        </div>

        <div className="text-center relative z-10 max-w-md mx-auto p-8">
          <div className="text-8xl mb-6">🌙</div>
          <h1 className="text-4xl font-bold mb-4 text-amber-200">Creation Not Found</h1>
          <p className="text-amber-300 mb-8 text-lg">
            {error || `Sorry, we couldn't find ${name ? decodeURIComponent(name) : 'this'}'s Eid greeting.`}
          </p>
          <div className="space-y-4">
            <a
              href="/gallery"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium inline-block mr-4"
            >
              Browse Gallery 🌟
            </a>
            <a
              href="/"
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-medium inline-block"
            >
              Create Your Own 🎨
            </a>
          </div>
        </div>
      </div>
    )
  }

  let finalHTML = submission.html_content
  
  // Inject additional CSS if provided
  if (submission.css_content?.trim()) {
    const cssInjection = `<style>${submission.css_content}</style></head>`
    finalHTML = finalHTML.replace('</head>', cssInjection)
  }

  return (
    <div className="min-h-screen relative">
      <div
        dangerouslySetInnerHTML={{ __html: finalHTML }}
      />
      
      {/* Floating creator info */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-xl backdrop-blur-sm border border-amber-600 shadow-2xl">
        <div className="text-sm mb-1">
          Created by: <strong className="text-amber-300">{submission.name}</strong>
        </div>
        <div className="text-xs text-gray-300 mb-3">
          {new Date(submission.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="flex gap-2">
          <a 
            href="/gallery"
            className="text-amber-300 hover:text-amber-200 text-sm transition-colors px-2 py-1 bg-amber-900 bg-opacity-30 rounded"
          >
            Gallery 🌟
          </a>
          <a 
            href="/"
            className="text-blue-300 hover:text-blue-200 text-sm transition-colors px-2 py-1 bg-blue-900 bg-opacity-30 rounded"
          >
            Create →
          </a>
        </div>
      </div>
    </div>
  )
}

export default ViewSubmission