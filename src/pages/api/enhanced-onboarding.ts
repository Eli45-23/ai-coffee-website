import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { enhancedOnboardingFormSchema } from '@/lib/validations'
import { uploadFileToSupabase, uploadMultipleFiles, createClientOnboardingSubmission } from '@/lib/supabase'
import { ClientOnboardingSubmission } from '@/types'
import { sendEmail, sendEmailWithAttachments, createEnhancedWelcomeEmail, createEnhancedAdminNotificationEmail, EnhancedFormSubmission } from '@/lib/resend'

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
      business_type_other: getFieldValue(fields.business_type_other),
      product_categories: JSON.parse(getFieldValue(fields.product_categories) || '[]'),
      product_categories_other: getFieldValue(fields.product_categories_other),
      customer_questions: JSON.parse(getFieldValue(fields.customer_questions) || '[]'),
      customer_questions_other: getFieldValue(fields.customer_questions_other),
      delivery_pickup: getFieldValue(fields.delivery_pickup) as 'delivery' | 'pickup' | 'both' | 'neither',
      delivery_options: JSON.parse(getFieldValue(fields.delivery_options) || '[]'),
      delivery_options_other: getFieldValue(fields.delivery_options_other),
      pickup_options: JSON.parse(getFieldValue(fields.pickup_options) || '[]'),
      pickup_options_other: getFieldValue(fields.pickup_options_other),
      delivery_notes: getFieldValue(fields.delivery_notes),
      menu_description: getFieldValue(fields.menu_description),
      plan: getFieldValue(fields.plan) as 'starter' | 'pro' | 'pro_plus',
      credential_sharing: getFieldValue(fields.credential_sharing) as 'direct' | 'sendsecurely' | 'call',
      credentials_direct: getFieldValue(fields.credentials_direct),
      has_faqs: getFieldValue(fields.has_faqs) as 'yes' | 'no',
      faq_content: getFieldValue(fields.faq_content),
      email: getFieldValue(fields.email) || '',
      consent_checkbox: getFieldValue(fields.consent_checkbox) === 'true',
    }

    // Validate the form data
    const validatedData = enhancedOnboardingFormSchema.parse(formData)

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

    // Save enhanced form submission to database
    const enhancedDbSubmission: Omit<ClientOnboardingSubmission, 'id' | 'created_at'> = {
      business_name: validatedData.business_name,
      email: validatedData.email,
      instagram_handle: validatedData.instagram_handle,
      other_platforms: validatedData.other_platforms,
      business_type: validatedData.business_type + (validatedData.business_type_other ? ` - ${validatedData.business_type_other}` : ''),
      product_categories: validatedData.product_categories,
      product_categories_other: validatedData.product_categories_other,
      common_questions: validatedData.customer_questions,
      common_questions_other: validatedData.customer_questions_other,
      delivery_option: validatedData.delivery_pickup,
      menu_file_url: menuFileUrl,
      menu_text: validatedData.menu_description,
      additional_docs_urls: additionalDocsUrls,
      plan: validatedData.plan,
      credential_sharing: validatedData.credential_sharing,
      has_faqs: validatedData.has_faqs,
      faq_file_url: faqFileUrl,
      consent_checkbox: validatedData.consent_checkbox,
      source: 'enhanced_onboarding_form',
      payment_status: 'pending'
    }

    let savedSubmission: ClientOnboardingSubmission
    try {
      savedSubmission = await createClientOnboardingSubmission(enhancedDbSubmission)
    } catch (dbError) {
      console.error('Failed to save enhanced onboarding submission to database:', dbError)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save submission to database. Please try again.' 
      })
    }

    // Create enhanced form submission object for emails
    const enhancedSubmission: EnhancedFormSubmission = {
      ...validatedData,
      menuFileUrl,
      faqFileUrl,
      additionalDocsUrls,
      submissionId: savedSubmission.id!
    }

    // Send welcome email to customer
    try {
      const welcomeEmail = createEnhancedWelcomeEmail(enhancedSubmission)
      await sendEmail(welcomeEmail, { preventDuplicates: true, emailType: 'form_submission' })
      console.log(`Welcome email sent to ${validatedData.email}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the entire request if email fails
    }

    // Send notification email to admin
    try {
      const adminEmail = createEnhancedAdminNotificationEmail(enhancedSubmission)
      
      // Prepare attachments for admin email
      const attachments = []
      if (menuFileUrl) {
        attachments.push({ filename: 'menu-document', url: menuFileUrl })
      }
      if (faqFileUrl) {
        attachments.push({ filename: 'faq-document', url: faqFileUrl })
      }
      if (additionalDocsUrls && additionalDocsUrls.length > 0) {
        additionalDocsUrls.forEach((url, index) => {
          attachments.push({ filename: `additional-document-${index + 1}`, url })
        })
      }

      if (attachments.length > 0) {
        await sendEmailWithAttachments(adminEmail, attachments, { preventDuplicates: true, emailType: 'form_submission' })
      } else {
        await sendEmail(adminEmail, { preventDuplicates: true, emailType: 'form_submission' })
      }
      console.log(`Admin notification sent for ${validatedData.business_name} with ${attachments.length} attachments`)
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the entire request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Enhanced onboarding form submitted successfully',
      submissionId: savedSubmission.id!,
    })

  } catch (error) {
    console.error('Enhanced onboarding submission error:', error)
    
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