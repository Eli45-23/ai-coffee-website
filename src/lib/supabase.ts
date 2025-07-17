import { createClient } from '@supabase/supabase-js'
import { ClientOnboardingSubmission } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Log the environment on server startup
if (typeof window === 'undefined') {
  console.log('Supabase client initialization (server-side):', {
    urlSet: !!supabaseUrl,
    keySet: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length,
    keyLength: supabaseAnonKey?.length,
    nodeEnv: process.env.NODE_ENV
  })
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `Supabase environment variables missing: URL=${supabaseUrl ? 'Set' : 'Missing'}, Key=${supabaseAnonKey ? 'Set' : 'Missing'}`
  console.error(errorMsg)
  if (typeof window === 'undefined') {
    // Server-side: throw error to prevent bad initialization
    throw new Error(errorMsg)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Legacy form submission interface (keep for backward compatibility)
export interface FormSubmission {
  id?: string
  name: string
  email: string
  phone?: string
  company?: string
  plan: 'starter' | 'pro' | 'pro_plus'
  instagram_login?: string
  facebook_login?: string
  twitter_login?: string
  linkedin_login?: string
  tiktok_login?: string
  login_sharing_preference: string
  file_url?: string
  source: string
  payment_status: 'pending' | 'completed'
  stripe_session_id?: string
  created_at?: string
}

// Legacy functions (keep for backward compatibility)
export async function createFormSubmission(data: Omit<FormSubmission, 'id' | 'created_at'>) {
  const { data: submission, error } = await supabase
    .from('form_submissions')
    .insert([data])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create form submission: ${error.message}`)
  }

  return submission
}

export async function updateFormSubmission(id: string, updates: Partial<FormSubmission>) {
  const { data, error } = await supabase
    .from('form_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update form submission: ${error.message}`)
  }

  return data
}

export async function getFormSubmissionByStripeSession(sessionId: string) {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error) {
    throw new Error(`Failed to get form submission: ${error.message}`)
  }

  return data
}

// Client onboarding functions (used by legacy API and Stripe webhook)
export async function createClientOnboardingSubmission(data: Omit<ClientOnboardingSubmission, 'id' | 'created_at'>) {
  const { data: submission, error } = await supabase
    .from('client_onboarding')
    .insert([data])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create client onboarding submission: ${error.message}`)
  }

  return submission
}

export async function updateClientOnboardingSubmission(id: string, updates: Partial<ClientOnboardingSubmission>) {
  const { data, error } = await supabase
    .from('client_onboarding')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update client onboarding submission: ${error.message}`)
  }

  return data
}

export async function getClientOnboardingSubmissionByStripeSession(sessionId: string) {
  const { data, error } = await supabase
    .from('client_onboarding')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error) {
    throw new Error(`Failed to get client onboarding submission: ${error.message}`)
  }

  return data
}

// File upload functions - Support both browser File and formidable File types
export async function uploadFileToSupabase(
  file: File | import('formidable').File, 
  bucket: string, 
  folder: string = ''
): Promise<string> {
  // Handle both browser File and formidable File types
  let fileName: string
  let fileBuffer: Buffer | Uint8Array
  
  if ('filepath' in file) {
    // Formidable File (server-side)
    const fs = await import('fs')
    fileName = file.originalFilename || file.newFilename || 'unnamed-file'
    fileBuffer = fs.readFileSync(file.filepath)
  } else {
    // Browser File (client-side)
    fileName = file.name
    fileBuffer = new Uint8Array(await file.arrayBuffer())
  }

  const fileExt = fileName.split('.').pop()
  const sanitizedFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function uploadMultipleFiles(
  files: (File | import('formidable').File)[], 
  bucket: string, 
  folder: string = ''
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFileToSupabase(file, bucket, folder))
  return Promise.all(uploadPromises)
}

