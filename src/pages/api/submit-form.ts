import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { createFormSubmission } from '@/lib/supabase'
import { sendEmail, createWelcomeEmail, createAdminNotificationEmail } from '@/lib/resend'
import { onboardingFormSchema } from '@/lib/validations'

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
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)

    // Extract form data
    const formData = {
      name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
      email: Array.isArray(fields.email) ? fields.email[0] : fields.email,
      phone: Array.isArray(fields.phone) ? fields.phone?.[0] : fields.phone,
      company: Array.isArray(fields.company) ? fields.company?.[0] : fields.company,
      plan: Array.isArray(fields.plan) ? fields.plan[0] : fields.plan,
      instagram_login: Array.isArray(fields.instagram_login) ? fields.instagram_login?.[0] : fields.instagram_login,
      facebook_login: Array.isArray(fields.facebook_login) ? fields.facebook_login?.[0] : fields.facebook_login,
      twitter_login: Array.isArray(fields.twitter_login) ? fields.twitter_login?.[0] : fields.twitter_login,
      linkedin_login: Array.isArray(fields.linkedin_login) ? fields.linkedin_login?.[0] : fields.linkedin_login,
      tiktok_login: Array.isArray(fields.tiktok_login) ? fields.tiktok_login?.[0] : fields.tiktok_login,
      login_sharing_preference: Array.isArray(fields.login_sharing_preference) 
        ? fields.login_sharing_preference[0] 
        : fields.login_sharing_preference,
    }

    // Validate the form data
    const validatedData = onboardingFormSchema.parse(formData)

    // Handle file upload if present
    let fileUrl: string | undefined
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
    
    if (uploadedFile) {
      // In a production environment, you would upload this to a storage service
      // For now, we'll just store the filename
      fileUrl = uploadedFile.newFilename || uploadedFile.originalFilename || undefined
    }

    // Create submission in Supabase
    const submission = await createFormSubmission({
      ...validatedData,
      file_url: fileUrl,
      source: 'ai-chatflows.com',
      payment_status: 'pending',
    })

    // Send welcome email to customer
    try {
      const welcomeEmail = createWelcomeEmail(submission)
      await sendEmail(welcomeEmail)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the entire request if email fails
    }

    // Send notification email to admin
    try {
      const adminEmail = createAdminNotificationEmail(submission)
      await sendEmail(adminEmail)
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the entire request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission.id,
    })

  } catch (error) {
    console.error('Form submission error:', error)
    
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