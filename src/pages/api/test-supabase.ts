import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Test Supabase Connection')
  console.log('Environment check:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
  })

  try {
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('client_onboarding')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase query error:', error)
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error,
        env: {
          urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlFormat: {
            startsWithHttps: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://'),
            includesSupabase: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase'),
          }
        }
      })
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Supabase connection successful',
      data,
      env: {
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    })
  } catch (err) {
    console.error('Test endpoint error:', err)
    return res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error',
      type: err instanceof TypeError ? 'TypeError' : 'Other',
      env: {
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlFormat: {
          startsWithHttps: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://'),
          includesSupabase: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase'),
        }
      }
    })
  }
}