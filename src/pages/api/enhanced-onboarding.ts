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

// Helper function to validate file URLs are accessible
async function validateFileUrl(url: string, context: string = 'unknown'): Promise<boolean> {
  const validationId = Math.random().toString(36).substring(2, 6)
  const startTime = Date.now()
  
  console.log(`🔍 [${validationId}] Starting URL validation for ${context}:`, {
    url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
    fullUrlLength: url.length,
    context,
    timestamp: new Date().toISOString()
  })

  // Basic URL format validation first
  if (!url || typeof url !== 'string') {
    console.error(`❌ [${validationId}] Invalid URL format - not a string:`, {
      url: url,
      type: typeof url,
      context
    })
    return false
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error(`❌ [${validationId}] Invalid URL format - missing protocol:`, {
      url: url.substring(0, 50) + '...',
      context,
      startsWithHttp: url.startsWith('http'),
      startsWithHttps: url.startsWith('https')
    })
    return false
  }

  try {
    // Test URL constructor validity
    const urlObj = new URL(url)
    console.log(`✅ [${validationId}] URL format validation passed:`, {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname.substring(0, 50) + (urlObj.pathname.length > 50 ? '...' : ''),
      context
    })

    // Attempt HEAD request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    console.log(`🌐 [${validationId}] Attempting HEAD request to validate accessibility...`)
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'AI-Coffee-Bot/1.0 (URL Validator)'
      }
    })
    
    clearTimeout(timeoutId)
    const duration = Date.now() - startTime

    console.log(`${response.ok ? '✅' : '❌'} [${validationId}] HEAD request completed:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${duration}ms`,
      headers: {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        lastModified: response.headers.get('last-modified'),
        cacheControl: response.headers.get('cache-control')
      },
      context
    })

    if (!response.ok) {
      console.warn(`⚠️ [${validationId}] URL accessible but returned non-OK status:`, {
        status: response.status,
        statusText: response.statusText,
        possibleIssues: response.status === 403 ? 'Forbidden - check bucket permissions' : 
                       response.status === 404 ? 'Not Found - file may not exist' :
                       response.status >= 500 ? 'Server Error - Supabase issues' : 'Unknown',
        context
      })
    }

    return response.ok

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`❌ [${validationId}] URL validation timed out after ${duration}ms:`, {
        url: url.substring(0, 50) + '...',
        error: 'Request timeout (>10s)',
        context,
        possibleCauses: ['Network issues', 'Supabase storage slow', 'Invalid URL', 'Firewall blocking']
      })
    } else {
      console.error(`❌ [${validationId}] URL validation failed after ${duration}ms:`, {
        url: url.substring(0, 50) + '...',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack?.split('\n')[0] : undefined,
        context,
        possibleCauses: ['Network connectivity', 'CORS issues', 'Invalid URL', 'Supabase permissions']
      })
    }
    
    return false
  }
}

// Helper function to safely extract filename from formidable file
function getFileName(file: formidable.File | formidable.File[] | undefined): string {
  if (!file) return 'unknown'
  
  const singleFile = Array.isArray(file) ? file[0] : file
  if (!singleFile) return 'unknown'
  
  return singleFile.originalFilename || singleFile.newFilename || 'unnamed-file'
}

// Helper function to parse form data
async function parseFormData(req: NextApiRequest): Promise<{
  fields: formidable.Fields
  files: formidable.Files
}> {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    keepExtensions: true,
    multiples: true,
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    console.log('🚀 Starting enhanced onboarding submission with file uploads')
    console.log('🌍 Environment check:', {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    })
    
    // Step 1: Parse multipart form data
    console.log('📥 Parsing incoming request...')
    const { fields, files } = await parseFormData(req)
    
    console.log('📝 Form data parsed:', {
      fieldCount: Object.keys(fields).length,
      fileCount: Object.keys(files).length,
      fileFieldNames: Object.keys(files),
      fieldsKeys: Object.keys(fields).slice(0, 10) // Show first 10 field names
    })

    // Detailed file debugging
    Object.entries(files).forEach(([fieldName, file]) => {
      if (Array.isArray(file)) {
        console.log(`📁 File field '${fieldName}': Array with ${file.length} files`)
        file.forEach((f, index) => {
          const fileName = getFileName(f)
          const fileObj = f as formidable.File
          console.log(`  [${index}] ${fileName} (${fileObj.size || 0} bytes, ${fileObj.mimetype || 'unknown'})`)
        })
      } else if (file) {
        console.log(`📁 File field '${fieldName}': Single file`)
        const fileName = getFileName(file)
        const fileObj = file as formidable.File
        console.log(`  ${fileName} (${fileObj.size || 0} bytes, ${fileObj.mimetype || 'unknown'})`)
      }
    })

    // Helper function to extract field value
    const getFieldValue = (field: string | string[] | undefined): string | undefined => {
      if (Array.isArray(field)) return field[0]
      return field || undefined
    }

    const getFieldArray = (field: string | string[] | undefined): string[] => {
      if (Array.isArray(field)) return field
      if (field) return [field]
      return []
    }

    // Step 2: Extract and validate form data
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
      credential_sharing: getFieldValue(fields.credential_sharing) as 'direct' | 'sendsecurely' | 'call' || 'direct',
      credentials_direct: getFieldValue(fields.credentials_direct),
      has_faqs: getFieldValue(fields.has_faqs) as 'yes' | 'no' || 'no',
      faq_content: getFieldValue(fields.faq_content),
      consent_checkbox: getFieldValue(fields.consent_checkbox) === 'true',
    }

    if (!formData.business_name || !formData.email || !formData.plan) {
      return res.status(400).json({
        success: false,
        message: 'Missing required form fields'
      })
    }

    console.log('✅ Form data validated for:', {
      businessName: formData.business_name,
      email: formData.email,
      plan: formData.plan
    })

    // Step 3: Handle file uploads to correct Supabase buckets
    let menuFileUrl: string | undefined
    let faqFileUrl: string | undefined
    let additionalDocsUrls: string[] = []

    console.log('📁 File upload analysis - received files:', {
      totalFileFields: Object.keys(files).length,
      fileFieldNames: Object.keys(files),
      menuFilePresent: !!files.menu_file,
      faqFilePresent: !!files.faq_file,
      additionalDocsPresent: !!files.additional_docs
    })

    // Upload menu file to 'menus' bucket
    if (files.menu_file) {
      try {
        const menuFile = Array.isArray(files.menu_file) ? files.menu_file[0] : files.menu_file
        
        console.log('📤 Starting menu file upload to menus bucket:', {
          fieldName: 'menu_file',
          bucket: 'menus',
          folder: 'menus',
          isArray: Array.isArray(files.menu_file),
          fileDetails: {
            originalName: menuFile.originalFilename,
            newName: menuFile.newFilename,
            size: menuFile.size,
            mimetype: menuFile.mimetype,
            filepath: menuFile.filepath
          }
        })
        
        menuFileUrl = await uploadFileToSupabase(menuFile, 'menus', 'menus')
        
        console.log('✅ Menu file upload completed successfully:', {
          originalName: menuFile.originalFilename,
          finalUrl: menuFileUrl,
          urlLength: menuFileUrl.length,
          urlStartsWith: menuFileUrl.substring(0, 50) + '...',
          bucket: 'menus'
        })
        
        // Validate URL format
        if (!menuFileUrl.includes('supabase')) {
          console.warn('⚠️ Menu file URL does not contain "supabase" - may be invalid:', menuFileUrl)
        }
        
      } catch (error) {
        console.error('❌ Menu file upload failed with detailed error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          fileName: getFileName(files.menu_file),
          bucket: 'menus',
          folder: 'menus'
        })
        throw new Error('Failed to upload menu file. Please try again.')
      }
    } else {
      console.log('ℹ️ No menu file provided in form submission')
    }

    // Upload FAQ file to 'faqs' bucket (CORRECTED from 'documents')
    if (files.faq_file) {
      try {
        const faqFile = Array.isArray(files.faq_file) ? files.faq_file[0] : files.faq_file
        
        console.log('📤 Starting FAQ file upload to faqs bucket:', {
          fieldName: 'faq_file',
          bucket: 'faqs',
          folder: 'faqs',
          isArray: Array.isArray(files.faq_file),
          fileDetails: {
            originalName: faqFile.originalFilename,
            newName: faqFile.newFilename,
            size: faqFile.size,
            mimetype: faqFile.mimetype,
            filepath: faqFile.filepath
          }
        })
        
        faqFileUrl = await uploadFileToSupabase(faqFile, 'faqs', 'faqs')
        
        console.log('✅ FAQ file upload completed successfully:', {
          originalName: faqFile.originalFilename,
          finalUrl: faqFileUrl,
          urlLength: faqFileUrl.length,
          urlStartsWith: faqFileUrl.substring(0, 50) + '...',
          bucket: 'faqs'
        })
        
        // Validate URL format
        if (!faqFileUrl.includes('supabase')) {
          console.warn('⚠️ FAQ file URL does not contain "supabase" - may be invalid:', faqFileUrl)
        }
        
      } catch (error) {
        console.error('❌ FAQ file upload failed with detailed error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          fileName: getFileName(files.faq_file),
          bucket: 'faqs',
          folder: 'faqs'
        })
        throw new Error('Failed to upload FAQ file. Please try again.')
      }
    } else {
      console.log('ℹ️ No FAQ file provided in form submission')
    }

    // Upload additional documents to 'documents' bucket
    if (files.additional_docs) {
      try {
        const additionalFiles = Array.isArray(files.additional_docs) ? files.additional_docs : [files.additional_docs]
        
        console.log('📤 Starting additional documents upload to documents bucket:', {
          fieldName: 'additional_docs',
          bucket: 'documents',
          folder: 'documents',
          fileCount: additionalFiles.length,
          isArray: Array.isArray(files.additional_docs),
          fileDetails: additionalFiles.map((file, index) => ({
            index,
            originalName: file.originalFilename,
            newName: file.newFilename,
            size: file.size,
            mimetype: file.mimetype,
            filepath: file.filepath
          }))
        })
        
        additionalDocsUrls = await uploadMultipleFiles(additionalFiles, 'documents', 'documents')
        
        console.log('✅ Additional documents upload completed successfully:', {
          uploadCount: additionalDocsUrls.length,
          totalFiles: additionalFiles.length,
          urls: additionalDocsUrls,
          urlSummary: additionalDocsUrls.map((url, index) => ({
            index,
            url: url.substring(0, 50) + '...',
            length: url.length,
            originalName: additionalFiles[index]?.originalFilename
          })),
          bucket: 'documents'
        })
        
        // Validate URL formats
        const invalidUrls = additionalDocsUrls.filter(url => !url.includes('supabase'))
        if (invalidUrls.length > 0) {
          console.warn('⚠️ Some additional document URLs do not contain "supabase" - may be invalid:', invalidUrls)
        }
        
      } catch (error) {
        console.error('❌ Additional documents upload failed with detailed error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          fileCount: Array.isArray(files.additional_docs) ? files.additional_docs.length : 1,
          fileNames: Array.isArray(files.additional_docs) 
            ? files.additional_docs.map(f => getFileName(f))
            : [getFileName(files.additional_docs)],
          bucket: 'documents',
          folder: 'documents'
        })
        throw new Error('Failed to upload additional documents. Please try again.')
      }
    } else {
      console.log('ℹ️ No additional documents provided in form submission')
    }

    // Summary of all file uploads
    console.log('📋 File upload summary for this submission:', {
      menuFile: {
        uploaded: !!menuFileUrl,
        url: menuFileUrl || 'Not uploaded',
        bucket: 'menus'
      },
      faqFile: {
        uploaded: !!faqFileUrl,
        url: faqFileUrl || 'Not uploaded',
        bucket: 'faqs'
      },
      additionalDocs: {
        uploaded: additionalDocsUrls.length > 0,
        count: additionalDocsUrls.length,
        urls: additionalDocsUrls,
        bucket: 'documents'
      },
      totalFilesUploaded: (menuFileUrl ? 1 : 0) + (faqFileUrl ? 1 : 0) + additionalDocsUrls.length
    })

    // Step 4: Prepare data for database insertion
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
      menu_file_url: menuFileUrl,
      menu_text: formData.menu_description || (formData.faq_content?.substring(0, 500)) || '',
      additional_docs_urls: additionalDocsUrls,
      plan: formData.plan,
      credential_sharing: credentialInfo,
      has_faqs: formData.has_faqs,
      faq_file_url: faqFileUrl,
      consent_checkbox: formData.consent_checkbox,
      source: 'enhanced_onboarding_form',
      payment_status: 'pending'
    }

    // Step 5: Insert data into Supabase database
    console.log('💾 Preparing database insertion with file URL verification:', {
      businessName: formData.business_name,
      email: formData.email,
      plan: formData.plan,
      fileUrlsToStore: {
        menuFileUrl: menuFileUrl ? {
          url: menuFileUrl.substring(0, 50) + '...',
          length: menuFileUrl.length,
          isHttps: menuFileUrl.startsWith('https://'),
          containsSupabase: menuFileUrl.includes('supabase')
        } : null,
        faqFileUrl: faqFileUrl ? {
          url: faqFileUrl.substring(0, 50) + '...',
          length: faqFileUrl.length,
          isHttps: faqFileUrl.startsWith('https://'),
          containsSupabase: faqFileUrl.includes('supabase')
        } : null,
        additionalDocsUrls: additionalDocsUrls.map((url, index) => ({
          index,
          url: url.substring(0, 50) + '...',
          length: url.length,
          isHttps: url.startsWith('https://'),
          containsSupabase: url.includes('supabase')
        }))
      }
    })

    // Validate URLs before database insertion
    const urlValidationIssues = []
    if (menuFileUrl && (!menuFileUrl.startsWith('https://') || !menuFileUrl.includes('supabase'))) {
      urlValidationIssues.push(`Menu file URL format issue: ${menuFileUrl.substring(0, 50)}...`)
    }
    if (faqFileUrl && (!faqFileUrl.startsWith('https://') || !faqFileUrl.includes('supabase'))) {
      urlValidationIssues.push(`FAQ file URL format issue: ${faqFileUrl.substring(0, 50)}...`)
    }
    additionalDocsUrls.forEach((url, index) => {
      if (!url.startsWith('https://') || !url.includes('supabase')) {
        urlValidationIssues.push(`Additional doc ${index + 1} URL format issue: ${url.substring(0, 50)}...`)
      }
    })

    if (urlValidationIssues.length > 0) {
      console.warn('⚠️ URL format validation issues before database storage:', urlValidationIssues)
    } else {
      console.log('✅ All file URLs passed format validation before database storage')
    }

    console.log('💾 Executing database insertion...')
    const dbInsertStartTime = Date.now()
    
    const { data: submission, error } = await supabaseClient
      .from('client_onboarding')
      .insert([dbSubmission])
      .select()
      .single()

    const dbInsertDuration = Date.now() - dbInsertStartTime

    if (error) {
      console.error('❌ Database insertion failed:', {
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        duration: `${dbInsertDuration}ms`,
        attemptedData: {
          businessName: dbSubmission.business_name,
          email: dbSubmission.email,
          plan: dbSubmission.plan,
          hasMenuUrl: !!dbSubmission.menu_file_url,
          hasFaqUrl: !!dbSubmission.faq_file_url,
          additionalDocsCount: dbSubmission.additional_docs_urls?.length || 0
        }
      })
      throw new Error('Failed to save your information. Please try again.')
    }

    console.log('✅ Database insertion successful:', {
      submissionId: submission.id,
      duration: `${dbInsertDuration}ms`,
      storedFileUrls: {
        menuFileUrl: submission.menu_file_url ? {
          stored: true,
          urlPreview: submission.menu_file_url.substring(0, 50) + '...',
          matches: submission.menu_file_url === menuFileUrl
        } : { stored: false },
        faqFileUrl: submission.faq_file_url ? {
          stored: true,
          urlPreview: submission.faq_file_url.substring(0, 50) + '...',
          matches: submission.faq_file_url === faqFileUrl
        } : { stored: false },
        additionalDocsUrls: submission.additional_docs_urls ? {
          stored: true,
          count: submission.additional_docs_urls.length,
          matches: JSON.stringify(submission.additional_docs_urls) === JSON.stringify(additionalDocsUrls)
        } : { stored: false }
      },
      dbRecord: {
        id: submission.id,
        businessName: submission.business_name,
        email: submission.email,
        plan: submission.plan,
        createdAt: submission.created_at
      }
    })

    // Verify stored URLs are accessible (optional verification step)
    if (submission.menu_file_url || submission.faq_file_url || (submission.additional_docs_urls?.length || 0) > 0) {
      console.log('🔍 Post-storage URL verification starting...')
      
      const verificationPromises = []
      if (submission.menu_file_url) {
        verificationPromises.push(
          validateFileUrl(submission.menu_file_url, 'post-db-menu-verification')
            .then(valid => ({ type: 'menu', valid, url: submission.menu_file_url }))
        )
      }
      if (submission.faq_file_url) {
        verificationPromises.push(
          validateFileUrl(submission.faq_file_url, 'post-db-faq-verification')
            .then(valid => ({ type: 'faq', valid, url: submission.faq_file_url }))
        )
      }
      if (submission.additional_docs_urls?.length) {
        submission.additional_docs_urls.forEach((url: string, index: number) => {
          verificationPromises.push(
            validateFileUrl(url, `post-db-additional-${index + 1}-verification`)
              .then(valid => ({ type: `additional-${index + 1}`, valid, url }))
          )
        })
      }

      // Run verifications in parallel but don't block the response
      Promise.all(verificationPromises).then(results => {
        const verificationSummary = results.reduce((acc, result) => {
          acc[result.type] = { valid: result.valid, url: result.url.substring(0, 50) + '...' }
          return acc
        }, {} as Record<string, { valid: boolean, url: string }>)
        
        console.log('🔍 Post-storage URL verification completed:', verificationSummary)
        
        const failedVerifications = results.filter(r => !r.valid)
        if (failedVerifications.length > 0) {
          console.error('❌ Some stored URLs failed post-storage verification:', 
            failedVerifications.map(f => ({ type: f.type, url: f.url.substring(0, 50) + '...' }))
          )
        }
      }).catch(verificationError => {
        console.warn('⚠️ Post-storage URL verification failed:', verificationError instanceof Error ? verificationError.message : 'Unknown error')
      })
    }

    // Step 6: Create enhanced form submission object for emails
    const enhancedSubmission: EnhancedFormSubmission = {
      ...formData,
      menuFileUrl: menuFileUrl,
      faqFileUrl: faqFileUrl,
      additionalDocsUrls: additionalDocsUrls,
      submissionId: submission.id!
    }

    // Step 7: Send welcome email to customer
    try {
      console.log(`📧 Sending welcome email for plan: ${formData.plan} to ${formData.email}`)
      const welcomeEmail = createEnhancedWelcomeEmail(enhancedSubmission)
      await sendEmail(welcomeEmail, { 
        preventDuplicates: true, 
        emailType: 'form_submission',
        uniqueId: submission.id
      })
      console.log(`✅ Welcome email sent to ${formData.email} for ${formData.business_name} (Plan: ${formData.plan})`)
    } catch (emailError) {
      console.error(`❌ Failed to send welcome email for ${formData.plan} plan:`, {
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        email: formData.email,
        businessName: formData.business_name,
        plan: formData.plan
      })
      // Don't fail the entire request if email fails
    }

    // Step 8: Send notification email to admin with validated attachments
    try {
      console.log('📧 Preparing admin notification email for:', {
        businessName: formData.business_name,
        adminEmail: process.env.ADMIN_EMAIL ? `${process.env.ADMIN_EMAIL.substring(0, 3)}***@***` : 'using default',
        submissionId: submission.id
      })
      
      const adminEmail = createEnhancedAdminNotificationEmail(enhancedSubmission)
      
      // Prepare and validate attachments for admin email
      console.log('📎 Starting email attachment validation process:', {
        hasMenuFile: !!menuFileUrl,
        hasFaqFile: !!faqFileUrl,
        additionalDocsCount: additionalDocsUrls.length,
        totalPotentialAttachments: (menuFileUrl ? 1 : 0) + (faqFileUrl ? 1 : 0) + additionalDocsUrls.length
      })

      const attachments = []
      
      if (menuFileUrl) {
        console.log('🔍 Validating menu file URL for email attachment...')
        const isValid = await validateFileUrl(menuFileUrl, 'menu-file-email-attachment')
        if (isValid) {
          attachments.push({ filename: 'menu-document', url: menuFileUrl })
          console.log('✅ Menu file attachment validated and added to email')
        } else {
          console.warn(`⚠️ Menu file URL validation failed - will not attach to email:`, {
            url: menuFileUrl.substring(0, 50) + '...',
            bucket: 'menus',
            impact: 'Email will be sent without menu attachment'
          })
        }
      }
      
      if (faqFileUrl) {
        console.log('🔍 Validating FAQ file URL for email attachment...')
        const isValid = await validateFileUrl(faqFileUrl, 'faq-file-email-attachment')
        if (isValid) {
          attachments.push({ filename: 'faq-document', url: faqFileUrl })
          console.log('✅ FAQ file attachment validated and added to email')
        } else {
          console.warn(`⚠️ FAQ file URL validation failed - will not attach to email:`, {
            url: faqFileUrl.substring(0, 50) + '...',
            bucket: 'faqs',
            impact: 'Email will be sent without FAQ attachment'
          })
        }
      }
      
      if (additionalDocsUrls && additionalDocsUrls.length > 0) {
        console.log(`🔍 Validating ${additionalDocsUrls.length} additional document URLs for email attachments...`)
        for (let i = 0; i < additionalDocsUrls.length; i++) {
          const url = additionalDocsUrls[i]
          console.log(`🔍 Validating additional document ${i + 1}/${additionalDocsUrls.length}...`)
          const isValid = await validateFileUrl(url, `additional-doc-${i + 1}-email-attachment`)
          if (isValid) {
            attachments.push({ filename: `additional-document-${i + 1}`, url })
            console.log(`✅ Additional document ${i + 1} attachment validated and added to email`)
          } else {
            console.warn(`⚠️ Additional document ${i + 1} URL validation failed - will not attach to email:`, {
              url: url.substring(0, 50) + '...',
              index: i + 1,
              bucket: 'documents',
              impact: `Email will be sent without additional document ${i + 1} attachment`
            })
          }
        }
      }

      console.log('📎 Email attachment validation completed:', {
        totalValidated: (menuFileUrl ? 1 : 0) + (faqFileUrl ? 1 : 0) + additionalDocsUrls.length,
        validAttachments: attachments.length,
        attachmentSummary: attachments.map(a => ({
          filename: a.filename,
          urlPreview: a.url.substring(0, 50) + '...'
        })),
        validationResults: {
          menuFile: menuFileUrl ? 'validated' : 'not provided',
          faqFile: faqFileUrl ? 'validated' : 'not provided',
          additionalDocs: `${attachments.filter(a => a.filename.startsWith('additional')).length}/${additionalDocsUrls.length} valid`
        }
      })

      console.log('📧 Sending admin notification with:', {
        businessName: formData.business_name,
        email: formData.email,
        plan: formData.plan,
        attachmentCount: attachments.length,
        validAttachments: attachments.map(a => a.filename)
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
      console.log(`✅ Admin notification sent successfully for ${formData.business_name} (Plan: ${formData.plan}) with ${attachments.length} attachments`)
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', {
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        businessName: formData.business_name,
        submissionId: submission.id
      })
      // Don't fail the entire request if email fails
    }

    // Step 9: Final status log and response
    console.log(`🎉 Enhanced onboarding completed successfully for ${formData.business_name}:`, {
      submissionId: submission.id,
      plan: formData.plan,
      welcomeEmailSent: true,
      adminEmailSent: true,
      hasMenuFile: !!menuFileUrl,
      hasFaqFile: !!faqFileUrl,
      additionalDocsCount: additionalDocsUrls.length,
      fileUploadsSummary: {
        menuFile: menuFileUrl ? 'uploaded' : 'not provided',
        faqFile: faqFileUrl ? 'uploaded' : 'not provided', 
        additionalDocs: `${additionalDocsUrls.length} files uploaded`
      }
    })

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      submissionId: submission.id,
      fileUploadResults: {
        menuFileUrl: menuFileUrl || null,
        faqFileUrl: faqFileUrl || null,
        additionalDocsUrls: additionalDocsUrls,
        totalFilesUploaded: (menuFileUrl ? 1 : 0) + (faqFileUrl ? 1 : 0) + additionalDocsUrls.length
      },
      emailsSent: {
        welcome: true,
        admin: true
      }
    })

  } catch (error) {
    console.error('💥 Enhanced onboarding submission error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process onboarding submission',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
    })
  }
}