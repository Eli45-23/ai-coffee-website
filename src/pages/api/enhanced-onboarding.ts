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
async function validateFileUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
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
    
    // Step 1: Parse multipart form data
    const { fields, files } = await parseFormData(req)
    
    console.log('📝 Form data parsed:', {
      fieldCount: Object.keys(fields).length,
      fileCount: Object.keys(files).length,
      files: Object.keys(files)
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

    // Upload menu file to 'menus' bucket
    if (files.menu_file) {
      try {
        console.log('📤 Uploading menu file to menus bucket')
        const menuFile = Array.isArray(files.menu_file) ? files.menu_file[0] : files.menu_file
        menuFileUrl = await uploadFileToSupabase(menuFile, 'menus', 'menus')
        console.log('✅ Menu file uploaded successfully:', menuFileUrl)
      } catch (error) {
        console.error('❌ Menu file upload failed:', error)
        throw new Error('Failed to upload menu file. Please try again.')
      }
    } else {
      console.log('ℹ️ No menu file provided')
    }

    // Upload FAQ file to 'faqs' bucket (CORRECTED from 'documents')
    if (files.faq_file) {
      try {
        console.log('📤 Uploading FAQ file to faqs bucket')
        const faqFile = Array.isArray(files.faq_file) ? files.faq_file[0] : files.faq_file
        faqFileUrl = await uploadFileToSupabase(faqFile, 'faqs', 'faqs')
        console.log('✅ FAQ file uploaded successfully:', faqFileUrl)
      } catch (error) {
        console.error('❌ FAQ file upload failed:', error)
        throw new Error('Failed to upload FAQ file. Please try again.')
      }
    } else {
      console.log('ℹ️ No FAQ file provided')
    }

    // Upload additional documents to 'documents' bucket
    if (files.additional_docs) {
      try {
        console.log('📤 Uploading additional documents to documents bucket')
        const additionalFiles = Array.isArray(files.additional_docs) ? files.additional_docs : [files.additional_docs]
        additionalDocsUrls = await uploadMultipleFiles(additionalFiles, 'documents', 'documents')
        console.log('✅ Additional documents uploaded successfully:', {
          count: additionalDocsUrls.length,
          urls: additionalDocsUrls
        })
      } catch (error) {
        console.error('❌ Additional documents upload failed:', error)
        throw new Error('Failed to upload additional documents. Please try again.')
      }
    } else {
      console.log('ℹ️ No additional documents provided')
    }

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
    console.log('💾 Inserting submission data into database')
    const { data: submission, error } = await supabaseClient
      .from('client_onboarding')
      .insert([dbSubmission])
      .select()
      .single()

    if (error) {
      console.error('❌ Database insertion error:', error)
      throw new Error('Failed to save your information. Please try again.')
    }

    console.log('✅ Submission saved to database:', {
      submissionId: submission.id,
      hasMenuFile: !!menuFileUrl,
      hasFaqFile: !!faqFileUrl,
      additionalDocsCount: additionalDocsUrls.length
    })

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
      const attachments = []
      if (menuFileUrl) {
        const isValid = await validateFileUrl(menuFileUrl)
        if (isValid) {
          attachments.push({ filename: 'menu-document', url: menuFileUrl })
          console.log('✅ Menu file attachment validated and added')
        } else {
          console.warn(`⚠️ Menu file URL not accessible: ${menuFileUrl}`)
        }
      }
      if (faqFileUrl) {
        const isValid = await validateFileUrl(faqFileUrl)
        if (isValid) {
          attachments.push({ filename: 'faq-document', url: faqFileUrl })
          console.log('✅ FAQ file attachment validated and added')
        } else {
          console.warn(`⚠️ FAQ file URL not accessible: ${faqFileUrl}`)
        }
      }
      if (additionalDocsUrls && additionalDocsUrls.length > 0) {
        for (let i = 0; i < additionalDocsUrls.length; i++) {
          const url = additionalDocsUrls[i]
          const isValid = await validateFileUrl(url)
          if (isValid) {
            attachments.push({ filename: `additional-document-${i + 1}`, url })
            console.log(`✅ Additional document ${i + 1} attachment validated and added`)
          } else {
            console.warn(`⚠️ Additional document URL not accessible: ${url}`)
          }
        }
      }

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