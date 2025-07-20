import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { clientOnboardingFormSchema } from '@/lib/validations'
import { createClientOnboardingSubmission, uploadFileToSupabase, uploadMultipleFiles } from '@/lib/supabase'
import { sendEmail, createWelcomeEmail, createAdminNotificationEmail } from '@/lib/resend'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Parse the form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)

    // Helper function to extract field value
    const getFieldValue = (field: string | string[] | undefined): string | undefined => {
      if (Array.isArray(field)) {
        return field[0] || undefined
      }
      return field || undefined
    }

    // Extract and parse form data
    const formData = {
      business_name: getFieldValue(fields.business_name) || '',
      instagram_handle: getFieldValue(fields.instagram_handle) || '',
      other_platforms: getFieldValue(fields.other_platforms),
      business_type: getFieldValue(fields.business_type) || '',
      product_categories: JSON.parse(getFieldValue(fields.product_categories) || '[]'),
      product_categories_other: getFieldValue(fields.product_categories_other),
      common_questions: JSON.parse(getFieldValue(fields.common_questions) || '[]'),
      common_questions_other: getFieldValue(fields.common_questions_other),
      delivery_option: getFieldValue(fields.delivery_option) as 'delivery' | 'pickup' | 'both' | 'neither',
      menu_text: getFieldValue(fields.menu_text),
      plan: getFieldValue(fields.plan) as 'starter' | 'pro' | 'pro_plus',
      credential_sharing: getFieldValue(fields.credential_sharing) as 'direct' | 'sendsecurely' | 'call',
      has_faqs: getFieldValue(fields.has_faqs) as 'yes' | 'no',
      email: getFieldValue(fields.email) || '',
      consent_checkbox: getFieldValue(fields.consent_checkbox) === 'true',
    }

    // Validate the form data
    const validatedData = clientOnboardingFormSchema.parse(formData)

    // Handle file uploads
    let menuFileUrl: string | undefined
    let faqFileUrl: string | undefined
    let additionalDocsUrls: string[] = []

    // Upload menu file if present
    const menuFile = Array.isArray(files.menu_file) ? files.menu_file[0] : files.menu_file
    if (menuFile) {
      try {
        menuFileUrl = await uploadFileToSupabase(menuFile, 'menus', 'menus')
      } catch (error) {
        console.error('Menu file upload error:', error)
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to upload menu file. Please try again.' 
        })
      }
    }

    // Upload FAQ file if present
    const faqFile = Array.isArray(files.faq_file) ? files.faq_file[0] : files.faq_file
    if (faqFile) {
      try {
        faqFileUrl = await uploadFileToSupabase(faqFile, 'documents', 'documents')
      } catch (error) {
        console.error('FAQ file upload error:', error)
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to upload FAQ file. Please try again.' 
        })
      }
    }

    // Upload additional documents
    const additionalDocs: import('formidable').File[] = []
    for (let i = 0; i < 10; i++) { // Support up to 10 additional docs
      const fileField = files[`additional_docs_${i}`]
      const file = Array.isArray(fileField) 
        ? fileField[0] 
        : fileField
      if (file) {
        additionalDocs.push(file)
      }
    }

    if (additionalDocs.length > 0) {
      try {
        additionalDocsUrls = await uploadMultipleFiles(additionalDocs, 'documents', 'documents')
      } catch (error) {
        console.error('Additional docs upload error:', error)
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to upload additional documents. Please try again.' 
        })
      }
    }

    // Create submission in Supabase
    const submissionData = {
      ...validatedData,
      menu_file_url: menuFileUrl,
      faq_file_url: faqFileUrl,
      additional_docs_urls: additionalDocsUrls,
      source: 'ai-chatflows.com',
      payment_status: 'pending' as const,
    }

    const submission = await createClientOnboardingSubmission(submissionData)

    // Send welcome email to customer
    try {
      // Create a compatible object for legacy email functions
      const emailData = {
        name: submission.business_name,
        email: submission.email,
        plan: submission.plan,
        id: submission.id || '',
        source: 'ai-chatflows.com',
        payment_status: 'pending' as const,
        created_at: submission.created_at || new Date().toISOString(),
        login_sharing_preference: 'direct' // Default value for legacy compatibility
      }
      const welcomeEmail = createWelcomeEmail(emailData)
      await sendEmail(welcomeEmail, { 
        preventDuplicates: true, 
        emailType: 'form_submission',
        uniqueId: submission.id 
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the entire request if email fails
    }

    // Send notification email to admin
    try {
      // Create a compatible object for legacy email functions
      const emailData = {
        name: submission.business_name,
        email: submission.email,
        plan: submission.plan,
        id: submission.id || '',
        source: 'ai-chatflows.com',
        payment_status: 'pending' as const,
        created_at: submission.created_at || new Date().toISOString(),
        login_sharing_preference: 'direct' // Default value for legacy compatibility
      }
      const adminEmail = createAdminNotificationEmail(emailData)
      await sendEmail(adminEmail, { 
        preventDuplicates: true, 
        emailType: 'form_submission',
        uniqueId: submission.id 
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the entire request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding form submitted successfully',
      submissionId: submission.id,
    })

  } catch (error) {
    console.error('Client onboarding submission error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid form data',
        error: 'errors' in error ? error.errors : error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
    })
  }
}