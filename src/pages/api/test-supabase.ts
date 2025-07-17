import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Test Supabase Connection')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  
  console.log('Environment check:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    urlValue: supabaseUrl?.substring(0, 50) + '...',
    urlStartsWithHttps: supabaseUrl?.startsWith('https://'),
    urlEndsWithSupabaseCo: supabaseUrl?.endsWith('.supabase.co'),
    urlLength: supabaseUrl?.length,
  })

  // First, try a basic fetch to the Supabase REST endpoint
  try {
    console.log('Testing basic fetch to Supabase...')
    const testUrl = `${supabaseUrl}/rest/v1/`
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      }
    })
    
    console.log('Basic fetch response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: 'Basic fetch failed',
        details: {
          status: response.status,
          statusText: response.statusText,
          url: testUrl
        }
      })
    }
    
  } catch (fetchError) {
    console.error('Basic fetch error:', fetchError)
    return res.status(500).json({
      success: false,
      error: 'Basic fetch failed',
      details: {
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        cause: fetchError instanceof Error ? fetchError.cause : undefined,
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      },
      env: {
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    })
  }

  // Now try the Supabase client
  try {
    console.log('Testing Supabase client...')
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
    console.error('Supabase client error:', err)
    return res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err,
      env: {
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    })
  }
}