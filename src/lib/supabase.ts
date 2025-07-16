import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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