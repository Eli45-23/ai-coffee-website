import { Resend } from 'resend'
import { FormSubmission } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export { resend }

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ai-chatflows.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ai-chatflows.com'

export interface EmailTemplate {
  to: string[]
  subject: string
  html: string
}

export function createWelcomeEmail(submission: FormSubmission): EmailTemplate {
  return {
    to: [submission.email],
    subject: 'Welcome to AIChatFlows - Your Onboarding is Confirmed!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 40px 20px;">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Welcome to AIChatFlows!</h1>
          <p style="color: #6b7280; font-size: 18px; margin-bottom: 30px;">
            Thank you for starting your onboarding process.
          </p>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Your Details</h2>
            <p><strong>Name:</strong> ${submission.name}</p>
            <p><strong>Email:</strong> ${submission.email}</p>
            <p><strong>Plan:</strong> ${submission.plan.replace('_', ' ').toUpperCase()}</p>
            ${submission.company ? `<p><strong>Company:</strong> ${submission.company}</p>` : ''}
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #1e40af; margin: 0;">
              <strong>Next Step:</strong> Please complete your payment to activate your account and receive your login credentials.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            If you have any questions, please contact us at ${ADMIN_EMAIL}
          </p>
        </div>
      </div>
    `,
  }
}

export function createAdminNotificationEmail(submission: FormSubmission): EmailTemplate {
  return {
    to: [ADMIN_EMAIL],
    subject: `New AIChatFlows Onboarding: ${submission.name} (${submission.plan})`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="padding: 20px;">
          <h2 style="color: #1f2937;">New Onboarding Submission</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> ${submission.name}</p>
            <p><strong>Email:</strong> ${submission.email}</p>
            <p><strong>Phone:</strong> ${submission.phone || 'Not provided'}</p>
            <p><strong>Company:</strong> ${submission.company || 'Not provided'}</p>
            <p><strong>Plan:</strong> ${submission.plan.replace('_', ' ').toUpperCase()}</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Social Media Logins</h3>
            ${submission.instagram_login ? `<p><strong>Instagram:</strong> ${submission.instagram_login}</p>` : ''}
            ${submission.facebook_login ? `<p><strong>Facebook:</strong> ${submission.facebook_login}</p>` : ''}
            ${submission.twitter_login ? `<p><strong>Twitter:</strong> ${submission.twitter_login}</p>` : ''}
            ${submission.linkedin_login ? `<p><strong>LinkedIn:</strong> ${submission.linkedin_login}</p>` : ''}
            ${submission.tiktok_login ? `<p><strong>TikTok:</strong> ${submission.tiktok_login}</p>` : ''}
            <p><strong>Sharing Preference:</strong> ${submission.login_sharing_preference}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Payment Status:</strong> ${submission.payment_status}</p>
            ${submission.file_url ? `<p><strong>File Uploaded:</strong> <a href="${submission.file_url}">View File</a></p>` : ''}
          </div>
        </div>
      </div>
    `,
  }
}

export function createPaymentConfirmationEmail(submission: FormSubmission): EmailTemplate {
  return {
    to: [submission.email],
    subject: 'Payment Confirmed - AIChatFlows Account Activated!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 40px 20px;">
          <h1 style="color: #059669; margin-bottom: 20px;">Payment Confirmed! 🎉</h1>
          <p style="color: #6b7280; font-size: 18px; margin-bottom: 30px;">
            Your AIChatFlows account has been activated.
          </p>
          
          <div style="background: #d1fae5; padding: 30px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #059669; margin-bottom: 20px;">What's Next?</h2>
            <p style="color: #065f46;">
              Our team will prepare your social media account access and reach out to you within 24 hours with your login credentials and setup instructions.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Your Plan: ${submission.plan.replace('_', ' ').toUpperCase()}</h3>
            <p style="color: #6b7280;">
              You now have access to all features included in your selected plan.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
            Questions? Contact us at ${ADMIN_EMAIL}
          </p>
        </div>
      </div>
    `,
  }
}

export async function sendEmail(template: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}