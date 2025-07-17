import { NextApiRequest, NextApiResponse } from 'next'
import { sendEmail, sendEmailWithAttachments, createEnhancedWelcomeEmail, createEnhancedAdminNotificationEmail, EnhancedFormSubmission } from '@/lib/resend'
import { ClientOnboardingSubmission, EnhancedOnboardingFormData } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Parse JSON body sent from frontend
    const { submission, formData, fileUrls } = req.body as {
      submission: ClientOnboardingSubmission
      formData: EnhancedOnboardingFormData
      fileUrls: {
        menuFileUrl?: string
        faqFileUrl?: string
        additionalDocsUrls: string[]
      }
    }

    if (!submission || !formData) {
      return res.status(400).json({
        success: false,
        message: 'Missing submission data'
      })
    }

    // Create enhanced form submission object for emails
    const enhancedSubmission: EnhancedFormSubmission = {
      ...formData,
      menuFileUrl: fileUrls.menuFileUrl,
      faqFileUrl: fileUrls.faqFileUrl,
      additionalDocsUrls: fileUrls.additionalDocsUrls,
      submissionId: submission.id!
    }

    // Send welcome email to customer
    try {
      const welcomeEmail = createEnhancedWelcomeEmail(enhancedSubmission)
      await sendEmail(welcomeEmail, { preventDuplicates: true, emailType: 'form_submission' })
      console.log(`Welcome email sent to ${formData.email}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the entire request if email fails
    }

    // Send notification email to admin
    try {
      console.log('Preparing admin notification email for:', {
        businessName: formData.business_name,
        adminEmail: process.env.ADMIN_EMAIL ? `${process.env.ADMIN_EMAIL.substring(0, 3)}***@***` : 'using default',
        submissionId: submission.id
      })
      
      const adminEmail = createEnhancedAdminNotificationEmail(enhancedSubmission)
      
      // Prepare attachments for admin email
      const attachments = []
      if (fileUrls.menuFileUrl) {
        attachments.push({ filename: 'menu-document', url: fileUrls.menuFileUrl })
      }
      if (fileUrls.faqFileUrl) {
        attachments.push({ filename: 'faq-document', url: fileUrls.faqFileUrl })
      }
      if (fileUrls.additionalDocsUrls && fileUrls.additionalDocsUrls.length > 0) {
        fileUrls.additionalDocsUrls.forEach((url, index) => {
          attachments.push({ filename: `additional-document-${index + 1}`, url })
        })
      }

      console.log('Sending admin notification with form data:', {
        businessName: formData.business_name,
        email: formData.email,
        plan: formData.plan,
        attachmentCount: attachments.length,
        hasMenuFile: !!fileUrls.menuFileUrl,
        hasFaqFile: !!fileUrls.faqFileUrl,
        additionalDocsCount: fileUrls.additionalDocsUrls?.length || 0
      })

      if (attachments.length > 0) {
        await sendEmailWithAttachments(adminEmail, attachments, { preventDuplicates: true, emailType: 'form_submission' })
      } else {
        await sendEmail(adminEmail, { preventDuplicates: true, emailType: 'form_submission' })
      }
      console.log(`✅ Admin notification sent successfully for ${formData.business_name} with ${attachments.length} attachments`)
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', {
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        businessName: formData.business_name,
        submissionId: submission.id
      })
      // Don't fail the entire request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Notification emails sent successfully',
    })

  } catch (error) {
    console.error('Email notification error:', error)
    
    res.status(500).json({
      success: false,
      message: 'Failed to send notification emails',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
    })
  }
}