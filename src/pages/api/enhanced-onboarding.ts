import { NextApiRequest, NextApiResponse } from 'next'
import { sendEmail, sendEmailWithAttachments, createEnhancedWelcomeEmail, createEnhancedAdminNotificationEmail, EnhancedFormSubmission } from '@/lib/resend'
import { ClientOnboardingSubmission, EnhancedOnboardingFormData } from '@/types'

// Helper function to validate file URLs are accessible
async function validateFileUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

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
    // Use file URLs from the database submission (they're already saved there)
    const enhancedSubmission: EnhancedFormSubmission = {
      ...formData,
      menuFileUrl: submission.menu_file_url || fileUrls.menuFileUrl,
      faqFileUrl: submission.faq_file_url || fileUrls.faqFileUrl,
      additionalDocsUrls: submission.additional_docs_urls || fileUrls.additionalDocsUrls || [],
      submissionId: submission.id!
    }

    // Log the file URLs for debugging
    console.log('File URLs for email:', {
      menuFileUrl: enhancedSubmission.menuFileUrl,
      faqFileUrl: enhancedSubmission.faqFileUrl,
      additionalDocsCount: enhancedSubmission.additionalDocsUrls?.length || 0,
      submissionId: submission.id
    })

    // Send welcome email to customer
    try {
      console.log(`Sending welcome email for plan: ${formData.plan} to ${formData.email}`)
      const welcomeEmail = createEnhancedWelcomeEmail(enhancedSubmission)
      await sendEmail(welcomeEmail, { 
        preventDuplicates: true, 
        emailType: 'form_submission',
        uniqueId: submission.id // Add submission ID for better duplicate prevention
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

    // Send notification email to admin
    try {
      console.log('Preparing admin notification email for:', {
        businessName: formData.business_name,
        adminEmail: process.env.ADMIN_EMAIL ? `${process.env.ADMIN_EMAIL.substring(0, 3)}***@***` : 'using default',
        submissionId: submission.id
      })
      
      const adminEmail = createEnhancedAdminNotificationEmail(enhancedSubmission)
      
      // Prepare attachments for admin email and validate URLs
      const attachments = []
      if (enhancedSubmission.menuFileUrl) {
        const isValid = await validateFileUrl(enhancedSubmission.menuFileUrl)
        if (isValid) {
          attachments.push({ filename: 'menu-document', url: enhancedSubmission.menuFileUrl })
        } else {
          console.warn(`Menu file URL not accessible: ${enhancedSubmission.menuFileUrl}`)
        }
      }
      if (enhancedSubmission.faqFileUrl) {
        const isValid = await validateFileUrl(enhancedSubmission.faqFileUrl)
        if (isValid) {
          attachments.push({ filename: 'faq-document', url: enhancedSubmission.faqFileUrl })
        } else {
          console.warn(`FAQ file URL not accessible: ${enhancedSubmission.faqFileUrl}`)
        }
      }
      if (enhancedSubmission.additionalDocsUrls && enhancedSubmission.additionalDocsUrls.length > 0) {
        for (let i = 0; i < enhancedSubmission.additionalDocsUrls.length; i++) {
          const url = enhancedSubmission.additionalDocsUrls[i]
          const isValid = await validateFileUrl(url)
          if (isValid) {
            attachments.push({ filename: `additional-document-${i + 1}`, url })
          } else {
            console.warn(`Additional document URL not accessible: ${url}`)
          }
        }
      }

      console.log('Sending admin notification with form data:', {
        businessName: formData.business_name,
        email: formData.email,
        plan: formData.plan,
        attachmentCount: attachments.length,
        hasMenuFile: !!enhancedSubmission.menuFileUrl,
        hasFaqFile: !!enhancedSubmission.faqFileUrl,
        additionalDocsCount: enhancedSubmission.additionalDocsUrls?.length || 0,
        validAttachments: attachments.map(a => a.filename)
      })

      if (attachments.length > 0) {
        await sendEmailWithAttachments(adminEmail, attachments, { 
          preventDuplicates: true, 
          emailType: 'form_submission',
          uniqueId: submission.id // Add submission ID for better duplicate prevention
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

    // Final status log
    console.log(`✅ Enhanced onboarding completed for ${formData.business_name}:`, {
      submissionId: submission.id,
      plan: formData.plan,
      welcomeEmailSent: true,
      adminEmailSent: true,
      hasMenuFile: !!enhancedSubmission.menuFileUrl,
      hasFaqFile: !!enhancedSubmission.faqFileUrl,
      additionalDocsCount: enhancedSubmission.additionalDocsUrls?.length || 0
    })

    res.status(200).json({
      success: true,
      message: 'Notification emails sent successfully',
      submissionId: submission.id,
      emailsSent: {
        welcome: true,
        admin: true
      }
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