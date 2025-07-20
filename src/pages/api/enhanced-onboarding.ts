import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { sendEmail, sendEmailWithAttachments, createEnhancedWelcomeEmail, createEnhancedAdminNotificationEmail, EnhancedFormSubmission } from '@/lib/resend'
import { uploadFileToSupabase, uploadMultipleFiles } from '@/lib/supabase'
import { supabaseClient } from '@/lib/supabase-client'
import { ClientOnboardingSubmission, EnhancedOnboardingFormData } from '@/types'

// Disable body parser to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
}

// Type guard to check if object is a valid formidable File
function isValidFormidableFile(file: unknown): file is formidable.File {
  return (
    typeof file === 'object' &&
    file !== null &&
    'originalFilename' in file &&
    'newFilename' in file &&
    'filepath' in file
  )
}

// Helper function to safely extract file metadata
function getFileMetadata(file: unknown): {
  name: string
  size: number
  type: string
} {
  if (!isValidFormidableFile(file)) {
    return {
      name: 'unknown',
      size: 0,
      type: 'unknown'
    }
  }

  return {
    name: file.originalFilename || file.newFilename || 'unnamed-file',
    size: file.size || 0,
    type: file.mimetype || 'unknown'
  }
}

// Helper function to safely extract filename from formidable file
function getFileName(file: formidable.File | formidable.File[] | undefined): string {
  if (!file) return 'unknown'
  
  const singleFile = Array.isArray(file) ? file[0] : file
  if (!singleFile) return 'unknown'
  
  return singleFile.originalFilename || singleFile.newFilename || 'unnamed-file'
}

// Helper function to parse form data with error handling
async function parseFormData(req: NextApiRequest): Promise<{
  fields: formidable.Fields
  files: formidable.Files
} | null> {
  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
      multiples: true,
    })

    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('❌ Form parsing error:', err)
          reject(err)
        } else {
          resolve({ fields, files })
        }
      })
    })
  } catch (error) {
    console.error('❌ Fatal form parsing error:', error)
    return null
  }
}

// Safe file upload function that doesn't throw
async function safeUploadFile(
  file: formidable.File,
  bucket: string,
  folder: string,
  fileType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const correlationId = Math.random().toString(36).substring(2, 8)
  
  try {
    const metadata = getFileMetadata(file)
    console.log(`🚀 [${correlationId}] Attempting ${fileType} file upload:`, {
      bucket,
      folder,
      fileName: metadata.name,
      fileSize: metadata.size,
      fileType: metadata.type
    })
    
    const url = await uploadFileToSupabase(file, bucket, folder)
    
    console.log(`✅ [${correlationId}] ${fileType} file upload successful:`, {
      url: url.substring(0, 50) + '...',
      bucket,
      originalName: metadata.name
    })
    
    return { success: true, url }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
    const metadata = getFileMetadata(file)
    
    console.error(`❌ [${correlationId}] ${fileType} file upload failed:`, {
      error: errorMessage,
      bucket,
      fileName: metadata.name,
      fileSize: metadata.size,
      impact: 'Continuing without this file'
    })
    
    return { success: false, error: errorMessage }
  }
}

// Safe multiple file upload function
async function safeUploadMultipleFiles(
  files: formidable.File[],
  bucket: string,
  folder: string,
  fileType: string
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const correlationId = Math.random().toString(36).substring(2, 8)
  const urls: string[] = []
  const errors: string[] = []
  
  console.log(`🚀 [${correlationId}] Attempting ${fileType} multiple file upload:`, {
    bucket,
    folder,
    fileCount: files.length,
    files: files.map(f => getFileMetadata(f))
  })
  
  try {
    const uploadedUrls = await uploadMultipleFiles(files, bucket, folder)
    urls.push(...uploadedUrls)
    
    console.log(`✅ [${correlationId}] ${fileType} multiple file upload successful:`, {
      uploadedCount: uploadedUrls.length,
      totalFiles: files.length,
      bucket
    })
    
    return { success: true, urls, errors }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
    errors.push(errorMessage)
    
    console.error(`❌ [${correlationId}] ${fileType} multiple file upload failed:`, {
      error: errorMessage,
      bucket,
      fileCount: files.length,
      impact: 'Continuing without these files'
    })
    
    return { success: false, urls, errors }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = Math.random().toString(36).substring(2, 8)
  
  // Add CORS headers for development and production
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  console.log(`🚀 [${requestId}] Starting enhanced onboarding submission`)
  console.log(`🌍 [${requestId}] Environment check:`, {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    adminEmail: !!process.env.ADMIN_EMAIL
  })

  // Track success/failure states
  const operationResults = {
    formParsing: false,
    dataValidation: false,
    menuFileUpload: { attempted: false, success: false, url: null as string | null, error: null as string | null },
    faqFileUpload: { attempted: false, success: false, url: null as string | null, error: null as string | null },
    additionalDocsUpload: { attempted: false, success: false, urls: [] as string[], errors: [] as string[] },
    databaseSave: false,
    welcomeEmail: false,
    adminEmail: false
  }

  try {
    // Step 1: Parse multipart form data
    console.log(`📥 [${requestId}] Parsing incoming request...`)
    const parsedData = await parseFormData(req)
    
    if (!parsedData) {
      console.error(`❌ [${requestId}] Form parsing failed completely`)
      return res.status(400).json({
        success: false,
        message: 'Failed to parse form data',
        operationResults
      })
    }
    
    const { fields, files } = parsedData
    operationResults.formParsing = true
    
    console.log(`✅ [${requestId}] Form data parsed successfully:`, {
      fieldCount: Object.keys(fields).length,
      fileCount: Object.keys(files).length,
      fileFieldNames: Object.keys(files),
      fieldsKeys: Object.keys(fields).slice(0, 10)
    })

    // Log file details for debugging with proper type guards
    Object.entries(files).forEach(([fieldName, file]) => {
      if (Array.isArray(file)) {
        console.log(`📁 [${requestId}] File field '${fieldName}': Array with ${file.length} files`)
        file.forEach((f, index) => {
          if (isValidFormidableFile(f)) {
            const metadata = getFileMetadata(f)
            console.log(`  [${index}] ${metadata.name} (${metadata.size} bytes, ${metadata.type})`)
          } else {
            console.log(`  [${index}] file metadata unavailable`)
          }
        })
      } else if (file) {
        console.log(`📁 [${requestId}] File field '${fieldName}': Single file`)
        if (isValidFormidableFile(file)) {
          const metadata = getFileMetadata(file)
          console.log(`  ${metadata.name} (${metadata.size} bytes, ${metadata.type})`)
        } else {
          console.log(`  file metadata unavailable`)
        }
      }
    })

    // Step 2: Extract and validate form data
    const getFieldValue = (field: string | string[] | undefined): string | undefined => {
      if (Array.isArray(field)) return field[0]
      return field || undefined
    }

    const getFieldArray = (field: string | string[] | undefined): string[] => {
      if (Array.isArray(field)) return field
      if (field) return [field]
      return []
    }

    const formData: EnhancedOnboardingFormData = {
      business_name: getFieldValue(fields.business_name) || '',
      email: getFieldValue(fields.email) || '',
      instagram_handle: getFieldValue(fields.instagram_handle) || '',
      other_platforms: getFieldValue(fields.other_platforms),
      business_type: getFieldValue(fields.business_type) || '',
      business_type_other: getFieldValue(fields.business_type_other),
      product_categories: getFieldArray(fields.product_categories),
      product_categories_other: getFieldValue(fields.product_categories_other),
      customer_questions: getFieldArray(fields.customer_questions),
      customer_questions_other: getFieldValue(fields.customer_questions_other),
      delivery_pickup: getFieldValue(fields.delivery_pickup) as 'delivery' | 'pickup' | 'both' | 'neither' || 'neither',
      delivery_options: getFieldArray(fields.delivery_options),
      delivery_options_other: getFieldValue(fields.delivery_options_other),
      pickup_options: getFieldArray(fields.pickup_options),
      pickup_options_other: getFieldValue(fields.pickup_options_other),
      delivery_notes: getFieldValue(fields.delivery_notes),
      menu_description: getFieldValue(fields.menu_description),
      plan: getFieldValue(fields.plan) as 'starter' | 'pro' | 'pro_plus' || 'starter',
      credential_sharing: getFieldValue(fields.credential_sharing) as 'direct' | 'sendsecurely' | 'call' || 'sendsecurely',
      credentials_direct: getFieldValue(fields.credentials_direct),
      has_faqs: getFieldValue(fields.has_faqs) as 'yes' | 'no' || 'no',
      faq_content: getFieldValue(fields.faq_content),
      consent_checkbox: getFieldValue(fields.consent_checkbox) === 'true',
    }

    // Validate required fields
    if (!formData.business_name || !formData.email || !formData.plan) {
      console.error(`❌ [${requestId}] Missing required form fields:`, {
        businessName: !!formData.business_name,
        email: !!formData.email,
        plan: !!formData.plan
      })
      return res.status(400).json({
        success: false,
        message: 'Missing required form fields: business name, email, and plan are required',
        operationResults
      })
    }

    operationResults.dataValidation = true
    console.log(`✅ [${requestId}] Form data validated successfully:`, {
      businessName: formData.business_name,
      email: formData.email,
      plan: formData.plan,
      hasFiles: Object.keys(files).length > 0
    })

    // Step 3: Handle file uploads with graceful error handling
    console.log(`📁 [${requestId}] Starting file upload phase:`, {
      menuFilePresent: !!files.menu_file,
      faqFilePresent: !!files.faq_file,
      additionalDocsPresent: !!files.additional_docs,
      totalFileFields: Object.keys(files).length
    })

    // Upload menu file to 'menus' bucket
    if (files.menu_file) {
      operationResults.menuFileUpload.attempted = true
      const menuFile = Array.isArray(files.menu_file) ? files.menu_file[0] : files.menu_file
      
      if (isValidFormidableFile(menuFile)) {
        console.log(`📤 [${requestId}] Attempting menu file upload...`)
        const menuResult = await safeUploadFile(menuFile, 'menus', 'menus', 'menu')
        
        operationResults.menuFileUpload.success = menuResult.success
        operationResults.menuFileUpload.url = menuResult.url || null
        operationResults.menuFileUpload.error = menuResult.error || null
      } else {
        console.error(`❌ [${requestId}] Invalid menu file object`)
        operationResults.menuFileUpload.error = 'Invalid file object'
      }
    } else {
      console.log(`ℹ️ [${requestId}] No menu file provided in form submission`)
    }

    // Upload FAQ file to 'faqs' bucket
    if (files.faq_file) {
      operationResults.faqFileUpload.attempted = true
      const faqFile = Array.isArray(files.faq_file) ? files.faq_file[0] : files.faq_file
      
      if (isValidFormidableFile(faqFile)) {
        console.log(`📤 [${requestId}] Attempting FAQ file upload...`)
        const faqResult = await safeUploadFile(faqFile, 'faqs', 'faqs', 'FAQ')
        
        operationResults.faqFileUpload.success = faqResult.success
        operationResults.faqFileUpload.url = faqResult.url || null
        operationResults.faqFileUpload.error = faqResult.error || null
      } else {
        console.error(`❌ [${requestId}] Invalid FAQ file object`)
        operationResults.faqFileUpload.error = 'Invalid file object'
      }
    } else {
      console.log(`ℹ️ [${requestId}] No FAQ file provided in form submission`)
    }

    // Upload additional documents to 'documents' bucket
    if (files.additional_docs) {
      operationResults.additionalDocsUpload.attempted = true
      const additionalFiles = Array.isArray(files.additional_docs) ? files.additional_docs : [files.additional_docs]
      
      // Filter to only valid formidable files
      const validFiles = additionalFiles.filter(isValidFormidableFile)
      
      if (validFiles.length > 0) {
        console.log(`📤 [${requestId}] Attempting additional documents upload...`)
        const docsResult = await safeUploadMultipleFiles(validFiles, 'documents', 'documents', 'additional documents')
        
        operationResults.additionalDocsUpload.success = docsResult.success
        operationResults.additionalDocsUpload.urls = docsResult.urls
        operationResults.additionalDocsUpload.errors = docsResult.errors
      } else {
        console.error(`❌ [${requestId}] No valid additional document files found`)
        operationResults.additionalDocsUpload.errors = ['No valid file objects']
      }
    } else {
      console.log(`ℹ️ [${requestId}] No additional documents provided in form submission`)
    }

    // Log file upload summary
    console.log(`📋 [${requestId}] File upload phase completed:`, {
      menuFile: {
        attempted: operationResults.menuFileUpload.attempted,
        success: operationResults.menuFileUpload.success,
        hasUrl: !!operationResults.menuFileUpload.url,
        error: operationResults.menuFileUpload.error
      },
      faqFile: {
        attempted: operationResults.faqFileUpload.attempted,
        success: operationResults.faqFileUpload.success,
        hasUrl: !!operationResults.faqFileUpload.url,
        error: operationResults.faqFileUpload.error
      },
      additionalDocs: {
        attempted: operationResults.additionalDocsUpload.attempted,
        success: operationResults.additionalDocsUpload.success,
        urlCount: operationResults.additionalDocsUpload.urls.length,
        errorCount: operationResults.additionalDocsUpload.errors.length
      },
      totalSuccessfulUploads: (operationResults.menuFileUpload.success ? 1 : 0) + 
                             (operationResults.faqFileUpload.success ? 1 : 0) + 
                             operationResults.additionalDocsUpload.urls.length
    })

    // Step 4: Prepare data for database insertion (always proceed regardless of file upload results)
    console.log(`💾 [${requestId}] Preparing database submission...`)
    
    let deliveryInfo = formData.delivery_pickup
    if (formData.delivery_pickup === 'delivery' || formData.delivery_pickup === 'both') {
      const deliveryOpts = formData.delivery_options || []
      if (deliveryOpts.length > 0) {
        deliveryInfo += ` - Delivery: ${deliveryOpts.join(', ')}`
        if (formData.delivery_options_other) {
          deliveryInfo += ` (${formData.delivery_options_other})`
        }
      }
    }
    if (formData.delivery_pickup === 'pickup' || formData.delivery_pickup === 'both') {
      const pickupOpts = formData.pickup_options || []
      if (pickupOpts.length > 0) {
        deliveryInfo += ` - Pickup: ${pickupOpts.join(', ')}`
        if (formData.pickup_options_other) {
          deliveryInfo += ` (${formData.pickup_options_other})`
        }
      }
    }
    if (formData.delivery_notes) {
      deliveryInfo += ` - Notes: ${formData.delivery_notes}`
    }

    let credentialInfo = formData.credential_sharing
    if (formData.credential_sharing === 'direct' && formData.credentials_direct) {
      credentialInfo += ` - Credentials provided`
    }

    const dbSubmission: Omit<ClientOnboardingSubmission, 'id' | 'created_at'> = {
      business_name: formData.business_name,
      email: formData.email,
      instagram_handle: formData.instagram_handle,
      other_platforms: formData.other_platforms,
      business_type: formData.business_type + (formData.business_type_other ? ` - ${formData.business_type_other}` : ''),
      product_categories: formData.product_categories,
      product_categories_other: formData.product_categories_other,
      common_questions: formData.customer_questions,
      common_questions_other: formData.customer_questions_other,
      delivery_option: deliveryInfo,
      menu_file_url: operationResults.menuFileUpload.url,
      menu_text: formData.menu_description || (formData.faq_content?.substring(0, 500)) || '',
      additional_docs_urls: operationResults.additionalDocsUpload.urls,
      plan: formData.plan,
      credential_sharing: credentialInfo,
      has_faqs: formData.has_faqs,
      faq_file_url: operationResults.faqFileUpload.url,
      consent_checkbox: formData.consent_checkbox,
      source: 'enhanced_onboarding_form',
      payment_status: 'pending'
    }

    // Step 5: Insert data into Supabase database
    console.log(`💾 [${requestId}] Executing database insertion...`)
    const dbInsertStartTime = Date.now()
    
    try {
      const { data: submission, error } = await supabaseClient
        .from('client_onboarding')
        .insert([dbSubmission])
        .select()
        .single()

      const dbInsertDuration = Date.now() - dbInsertStartTime

      if (error) {
        console.error(`❌ [${requestId}] Database insertion failed:`, {
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          duration: `${dbInsertDuration}ms`
        })
        throw new Error(`Database save failed: ${error.message}`)
      }

      operationResults.databaseSave = true
      console.log(`✅ [${requestId}] Database insertion successful:`, {
        submissionId: submission.id,
        duration: `${dbInsertDuration}ms`,
        businessName: submission.business_name,
        plan: submission.plan
      })

      // Step 6: Create enhanced form submission object for emails
      const enhancedSubmission: EnhancedFormSubmission = {
        ...formData,
        menuFileUrl: operationResults.menuFileUpload.url,
        faqFileUrl: operationResults.faqFileUpload.url,
        additionalDocsUrls: operationResults.additionalDocsUpload.urls,
        submissionId: submission.id!
      }

      // Step 7: Send welcome email to customer
      console.log(`📧 [${requestId}] Sending welcome email...`)
      try {
        const welcomeEmail = createEnhancedWelcomeEmail(enhancedSubmission)
        await sendEmail(welcomeEmail, { 
          preventDuplicates: true, 
          emailType: 'form_submission',
          uniqueId: submission.id
        })
        operationResults.welcomeEmail = true
        console.log(`✅ [${requestId}] Welcome email sent successfully to ${formData.email}`)
      } catch (emailError) {
        console.error(`❌ [${requestId}] Welcome email failed:`, {
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          email: formData.email,
          impact: 'User will not receive welcome email'
        })
        // Continue processing - don't fail entire request
      }

      // Step 8: Send admin notification email
      console.log(`📧 [${requestId}] Sending admin notification email...`)
      try {
        const adminEmail = createEnhancedAdminNotificationEmail(enhancedSubmission)
        
        // Prepare attachments only for successful uploads
        const attachments = []
        if (operationResults.menuFileUpload.success && operationResults.menuFileUpload.url) {
          attachments.push({ filename: 'menu-document', url: operationResults.menuFileUpload.url })
        }
        if (operationResults.faqFileUpload.success && operationResults.faqFileUpload.url) {
          attachments.push({ filename: 'faq-document', url: operationResults.faqFileUpload.url })
        }
        operationResults.additionalDocsUpload.urls.forEach((url, index) => {
          attachments.push({ filename: `additional-document-${index + 1}`, url })
        })

        console.log(`📎 [${requestId}] Admin email preparation:`, {
          businessName: formData.business_name,
          plan: formData.plan,
          attachmentCount: attachments.length,
          fileUploadErrors: [
            ...(operationResults.menuFileUpload.error ? [`Menu: ${operationResults.menuFileUpload.error}`] : []),
            ...(operationResults.faqFileUpload.error ? [`FAQ: ${operationResults.faqFileUpload.error}`] : []),
            ...operationResults.additionalDocsUpload.errors.map(err => `Additional: ${err}`)
          ]
        })

        if (attachments.length > 0) {
          await sendEmailWithAttachments(adminEmail, attachments, { 
            preventDuplicates: true, 
            emailType: 'form_submission',
            uniqueId: submission.id
          })
        } else {
          await sendEmail(adminEmail, { 
            preventDuplicates: true, 
            emailType: 'form_submission',
            uniqueId: submission.id
          })
        }
        
        operationResults.adminEmail = true
        console.log(`✅ [${requestId}] Admin notification sent successfully with ${attachments.length} attachments`)
      } catch (emailError) {
        console.error(`❌ [${requestId}] Admin notification email failed:`, {
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          businessName: formData.business_name,
          impact: 'Admin will not receive notification'
        })
        // Continue processing - don't fail entire request
      }

      // Step 9: Final success response
      const successfulFileUploads = (operationResults.menuFileUpload.success ? 1 : 0) + 
                                  (operationResults.faqFileUpload.success ? 1 : 0) + 
                                  operationResults.additionalDocsUpload.urls.length

      console.log(`🎉 [${requestId}] Enhanced onboarding completed:`, {
        submissionId: submission.id,
        businessName: formData.business_name,
        plan: formData.plan,
        operationSummary: {
          formParsing: operationResults.formParsing,
          dataValidation: operationResults.dataValidation,
          databaseSave: operationResults.databaseSave,
          welcomeEmail: operationResults.welcomeEmail,
          adminEmail: operationResults.adminEmail,
          fileUploads: {
            attempted: operationResults.menuFileUpload.attempted || operationResults.faqFileUpload.attempted || operationResults.additionalDocsUpload.attempted,
            successful: successfulFileUploads,
            failed: (operationResults.menuFileUpload.attempted && !operationResults.menuFileUpload.success ? 1 : 0) +
                   (operationResults.faqFileUpload.attempted && !operationResults.faqFileUpload.success ? 1 : 0) +
                   operationResults.additionalDocsUpload.errors.length
          }
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully',
        submissionId: submission.id,
        operationResults,
        fileUploadResults: {
          menuFileUrl: operationResults.menuFileUpload.url,
          faqFileUrl: operationResults.faqFileUpload.url,
          additionalDocsUrls: operationResults.additionalDocsUpload.urls,
          totalFilesUploaded: successfulFileUploads,
          uploadErrors: [
            ...(operationResults.menuFileUpload.error ? [operationResults.menuFileUpload.error] : []),
            ...(operationResults.faqFileUpload.error ? [operationResults.faqFileUpload.error] : []),
            ...operationResults.additionalDocsUpload.errors
          ]
        },
        emailsSent: {
          welcome: operationResults.welcomeEmail,
          admin: operationResults.adminEmail
        }
      })

    } catch (dbError) {
      console.error(`❌ [${requestId}] Database operation failed:`, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        businessName: formData.business_name,
        plan: formData.plan
      })
      
      return res.status(500).json({
        success: false,
        message: 'Failed to save submission to database',
        error: dbError instanceof Error ? dbError.message : 'Database error',
        operationResults
      })
    }

  } catch (error) {
    console.error(`💥 [${requestId}] Fatal error in enhanced onboarding:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operationResults
    })
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error occurred',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Please try again',
      operationResults
    })
  }
}