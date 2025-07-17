import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { enhancedOnboardingFormSchema } from '@/lib/validations'
import { uploadFileToSupabase, uploadMultipleFiles } from '@/lib/supabase'
import { sendEmail, createWelcomeEmail } from '@/lib/resend'

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

    // For now, we'll use a simple storage approach (could be enhanced to use Supabase)
    // Since this is just for submission tracking before Stripe redirect
    const submissionId = Date.now().toString() + Math.random().toString(36).substring(2)

    // Send welcome email to customer
    try {
      // Create a compatible object for legacy email functions
      const emailData = {
        name: validatedData.business_name,
        email: validatedData.email,
        plan: validatedData.plan,
        id: submissionId,
        source: 'ai-chatflows.com',
        payment_status: 'pending' as const,
        created_at: new Date().toISOString(),
        login_sharing_preference: 'direct' // Default value for legacy compatibility
      }
      const welcomeEmail = createWelcomeEmail(emailData)
      await sendEmail(welcomeEmail)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the entire request if email fails
    }

    // Send notification email to admin
    try {
      // Create a comprehensive admin notification with enhanced data
      const adminEmailContent = `
        New Enhanced Onboarding Submission:
        
        Business: ${validatedData.business_name}
        Instagram: ${validatedData.instagram_handle}
        Type: ${validatedData.business_type}${validatedData.business_type_other ? ` (${validatedData.business_type_other})` : ''}
        Email: ${validatedData.email}
        Plan: ${validatedData.plan}
        
        Categories: ${validatedData.product_categories.join(', ')}${validatedData.product_categories_other ? ` (Other: ${validatedData.product_categories_other})` : ''}
        
        Customer Questions: ${validatedData.customer_questions.join(', ')}${validatedData.customer_questions_other ? ` (Other: ${validatedData.customer_questions_other})` : ''}
        
        Delivery/Pickup: ${validatedData.delivery_pickup}
        ${validatedData.delivery_options?.length ? `Delivery Options: ${validatedData.delivery_options.join(', ')}` : ''}
        ${validatedData.pickup_options?.length ? `Pickup Options: ${validatedData.pickup_options.join(', ')}` : ''}
        
        Credentials: ${validatedData.credential_sharing}
        FAQs: ${validatedData.has_faqs}
        
        Files uploaded: ${[menuFileUrl, faqFileUrl, ...additionalDocsUrls].filter(Boolean).length}
        
        Notes: ${validatedData.delivery_notes || 'None'}
      `
      
      const adminEmail = {
        to: ['eliascolon23@gmail.com'],
        subject: `New Enhanced Onboarding: ${validatedData.business_name}`,
        html: adminEmailContent.replace(/\n/g, '<br>')
      }
      await sendEmail(adminEmail)
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the entire request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Enhanced onboarding form submitted successfully',
      submissionId: submissionId,
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