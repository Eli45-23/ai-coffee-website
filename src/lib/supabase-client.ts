import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Frontend Supabase client - runs in browser context
// This works with RLS policies using the anon key
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to upload file to Supabase storage
export async function uploadFileToSupabaseStorage(
  file: File,
  bucket: string,
  folder: string = ''
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

// Helper function to upload multiple files
export async function uploadMultipleFilesToStorage(
  files: File[],
  bucket: string,
  folder: string = ''
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFileToSupabaseStorage(file, bucket, folder))
  return Promise.all(uploadPromises)
}