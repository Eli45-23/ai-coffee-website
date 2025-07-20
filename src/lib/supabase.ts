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
  const uploadStartTime = Date.now()
  const correlationId = Math.random().toString(36).substring(2, 8)
  
  console.log(`🚀 [${correlationId}] Starting file upload to Supabase:`, {
    bucket,
    folder,
    uploadStartTime: new Date(uploadStartTime).toISOString()
  })

  // Handle both browser File and formidable File types
  let fileName: string
  let fileBuffer: Buffer | Uint8Array
  let fileSize: number
  let fileType: string | undefined
  
  if ('filepath' in file) {
    // Formidable File (server-side)
    const fs = await import('fs')
    fileName = file.originalFilename || file.newFilename || 'unnamed-file'
    fileSize = file.size || 0
    fileType = file.mimetype || undefined
    
    console.log(`📁 [${correlationId}] Processing formidable file:`, {
      originalName: file.originalFilename,
      newName: file.newFilename,
      size: fileSize,
      type: fileType,
      filepath: file.filepath
    })
    
    try {
      fileBuffer = fs.readFileSync(file.filepath)
      console.log(`✅ [${correlationId}] File read successfully from disk, buffer size: ${fileBuffer.length} bytes`)
    } catch (readError) {
      console.error(`❌ [${correlationId}] Failed to read file from disk:`, readError)
      throw new Error(`Failed to read uploaded file: ${readError instanceof Error ? readError.message : 'Unknown error'}`)
    }
  } else {
    // Browser File (client-side)
    fileName = file.name
    fileSize = file.size
    fileType = file.type
    
    console.log(`🌐 [${correlationId}] Processing browser file:`, {
      name: fileName,
      size: fileSize,
      type: fileType
    })
    
    try {
      fileBuffer = new Uint8Array(await file.arrayBuffer())
      console.log(`✅ [${correlationId}] Browser file converted to buffer, size: ${fileBuffer.length} bytes`)
    } catch (bufferError) {
      console.error(`❌ [${correlationId}] Failed to convert browser file to buffer:`, bufferError)
      throw new Error(`Failed to process uploaded file: ${bufferError instanceof Error ? bufferError.message : 'Unknown error'}`)
    }
  }

  // Validate file properties
  if (!fileName || fileName === 'unnamed-file') {
    console.warn(`⚠️ [${correlationId}] File has no proper name, using fallback`)
    fileName = `upload-${Date.now()}`
  }
  
  if (fileSize === 0) {
    console.warn(`⚠️ [${correlationId}] File appears to be empty (0 bytes)`)
  } else if (fileSize > 10 * 1024 * 1024) {
    console.warn(`⚠️ [${correlationId}] Large file detected: ${(fileSize / 1024 / 1024).toFixed(2)}MB`)
  }

  // Create sanitized filename with timestamp for easy identification
  const fileExt = fileName.split('.').pop() || 'unknown'
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '')
  const sanitizedFileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName

  console.log(`📝 [${correlationId}] Generated file path:`, {
    originalName: fileName,
    sanitizedName: sanitizedFileName,
    fullPath: filePath,
    fileExtension: fileExt
  })

  // Check if bucket exists (attempt to list it)
  try {
    console.log(`🔍 [${correlationId}] Validating bucket '${bucket}' exists...`)
    const { data: bucketData, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.warn(`⚠️ [${correlationId}] Could not validate bucket existence:`, bucketError)
    } else {
      const bucketExists = bucketData?.some(b => b.name === bucket)
      console.log(`${bucketExists ? '✅' : '❌'} [${correlationId}] Bucket '${bucket}' ${bucketExists ? 'exists' : 'NOT FOUND'}`)
      
      if (!bucketExists) {
        console.error(`❌ [${correlationId}] Available buckets:`, bucketData?.map(b => b.name))
      }
    }
  } catch (bucketCheckError) {
    console.warn(`⚠️ [${correlationId}] Bucket validation failed:`, bucketCheckError)
  }

  // Attempt the upload
  console.log(`📤 [${correlationId}] Starting Supabase storage upload...`)
  const uploadAttemptTime = Date.now()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: fileType
    })

  const uploadDuration = Date.now() - uploadAttemptTime

  if (error) {
    console.error(`❌ [${correlationId}] Supabase upload failed after ${uploadDuration}ms:`, {
      error: error.message,
      errorDetails: error,
      bucket,
      filePath,
      fileSize,
      uploadDuration
    })
    throw new Error(`Failed to upload file to ${bucket}/${filePath}: ${error.message}`)
  }

  console.log(`✅ [${correlationId}] Upload successful after ${uploadDuration}ms:`, {
    bucket,
    path: data.path,
    fullName: data.fullPath,
    uploadDuration,
    fileSize
  })

  // Get public URL
  console.log(`🔗 [${correlationId}] Generating public URL...`)
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  // Validate the generated URL
  if (!publicUrl || !publicUrl.startsWith('http')) {
    console.error(`❌ [${correlationId}] Invalid public URL generated:`, publicUrl)
    throw new Error(`Failed to generate valid public URL for uploaded file`)
  }

  const totalDuration = Date.now() - uploadStartTime
  console.log(`🎉 [${correlationId}] File upload completed successfully:`, {
    publicUrl,
    totalDuration,
    bucket,
    filePath: data.path,
    originalName: fileName,
    finalSize: fileSize
  })

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

