import { Resend } from 'resend'
import { FormSubmission } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export { resend }

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ai-chatflows.com'
const ADMIN_EMAIL = 'eliascolon23@gmail.com'

export interface EmailTemplate {
  to: string[]
  subject: string
  html: string
}

export function createWelcomeEmail(submission: FormSubmission): EmailTemplate {
  return {
    to: [submission.email],
    subject: '🎉 Welcome to AIChatFlows – Setup Started',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AIChatFlows</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to AIChatFlows!</h1>
            <p style="color: #e2e8f0; margin: 16px 0 0 0; font-size: 18px;">Thank you for submitting your onboarding form</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 20px;">
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">🚀 Your Setup is Starting</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">
                We've received your onboarding form and our team is beginning the setup process for your AI-powered customer service solution.
              </p>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 32px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">📋 Next Steps</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Complete your payment to activate your account</li>
                <li>We'll prepare your social media integrations</li>
                <li>Receive your login credentials within 24 hours</li>
              </ul>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin: 32px 0;">
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">📊 Your Selected Plan</h3>
              <p style="color: #374151; margin: 0; font-size: 16px; font-weight: 600;">${submission.plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <p style="color: #6b7280; margin: 0; font-size: 16px;">
                Questions? We're here to help!
              </p>
              <p style="color: #3b82f6; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">
                📧 ${ADMIN_EMAIL}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 AIChatFlows. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
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

// Enhanced onboarding form email templates
export interface EnhancedFormSubmission {
  business_name: string
  email: string
  instagram_handle: string
  other_platforms?: string
  business_type: string
  business_type_other?: string
  product_categories: string[]
  product_categories_other?: string
  customer_questions: string[]
  customer_questions_other?: string
  delivery_pickup: 'delivery' | 'pickup' | 'both' | 'neither'
  delivery_options?: string[]
  delivery_options_other?: string
  pickup_options?: string[]
  pickup_options_other?: string
  delivery_notes?: string
  menu_description?: string
  plan: 'starter' | 'pro' | 'pro_plus'
  credential_sharing: 'direct' | 'sendsecurely' | 'call'
  credentials_direct?: string
  has_faqs: 'yes' | 'no'
  faq_content?: string
  menuFileUrl?: string
  faqFileUrl?: string
  additionalDocsUrls?: string[]
  submissionId: string
}

export function createEnhancedAdminNotificationEmail(submission: EnhancedFormSubmission): EmailTemplate {
  const planNames = {
    starter: 'Starter – $100/month',
    pro: 'Pro – $150/month', 
    pro_plus: 'Pro Plus – $200/month'
  }

  const deliveryOptionsText = submission.delivery_options?.length 
    ? submission.delivery_options.join(', ') + (submission.delivery_options_other ? `, ${submission.delivery_options_other}` : '')
    : 'None'

  const pickupOptionsText = submission.pickup_options?.length
    ? submission.pickup_options.join(', ') + (submission.pickup_options_other ? `, ${submission.pickup_options_other}` : '')
    : 'None'

  const productCategoriesText = submission.product_categories.join(', ') + (submission.product_categories_other ? `, ${submission.product_categories_other}` : '')
  const customerQuestionsText = submission.customer_questions.join(', ') + (submission.customer_questions_other ? `, ${submission.customer_questions_other}` : '')

  const attachedFiles = [
    submission.menuFileUrl ? 'Menu' : null,
    submission.faqFileUrl ? 'FAQs' : null,
    ...(submission.additionalDocsUrls?.map((_, index) => `Document ${index + 1}`) || [])
  ].filter(Boolean)

  return {
    to: [ADMIN_EMAIL],
    subject: `📝 New Client Onboarding Form Submitted – ${submission.business_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Onboarding Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">📝 New Client Onboarding Form</h1>
            <p style="color: #fef3c7; margin: 12px 0 0 0; font-size: 16px;">${submission.business_name}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 20px;">
            
            <!-- Business Info Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">🔹 Business Info</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Name:</strong> ${submission.business_name}</p>
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Instagram:</strong> ${submission.instagram_handle}</p>
                ${submission.other_platforms ? `<p style="margin: 0 0 8px 0; color: #374151;"><strong>Other Platforms:</strong> ${submission.other_platforms}</p>` : ''}
                <p style="margin: 0; color: #374151;"><strong>Type:</strong> ${submission.business_type}${submission.business_type_other ? ` (${submission.business_type_other})` : ''}</p>
              </div>
            </div>

            <!-- Product Categories Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #10b981; padding-bottom: 8px;">🔹 Product Categories</h2>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #374151;">${productCategoriesText}</p>
              </div>
            </div>

            <!-- Customer Questions Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px;">🔹 Customer Questions</h2>
              <div style="background: #faf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; color: #374151;">${customerQuestionsText}</p>
              </div>
            </div>

            <!-- Delivery Method Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">🔹 Delivery Method</h2>
              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Method:</strong> ${submission.delivery_pickup.charAt(0).toUpperCase() + submission.delivery_pickup.slice(1)}</p>
                ${submission.delivery_pickup === 'delivery' || submission.delivery_pickup === 'both' ? `<p style="margin: 0 0 8px 0; color: #374151;"><strong>Delivery Options:</strong> ${deliveryOptionsText}</p>` : ''}
                ${submission.delivery_pickup === 'pickup' || submission.delivery_pickup === 'both' ? `<p style="margin: 0 0 8px 0; color: #374151;"><strong>Pickup Options:</strong> ${pickupOptionsText}</p>` : ''}
                ${submission.delivery_notes ? `<p style="margin: 0; color: #374151;"><strong>Notes:</strong> ${submission.delivery_notes}</p>` : ''}
              </div>
            </div>

            <!-- Menu & Docs Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">🔹 Menu & Docs</h2>
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                ${submission.menuFileUrl ? '<p style="margin: 0 0 8px 0; color: #374151;"><strong>Menu uploaded:</strong> ✅</p>' : '<p style="margin: 0 0 8px 0; color: #374151;"><strong>Menu uploaded:</strong> ❌</p>'}
                ${submission.menu_description ? `<p style="margin: 0 0 8px 0; color: #374151;"><strong>Additional Notes:</strong> "${submission.menu_description}"</p>` : ''}
                ${attachedFiles.length ? `<p style="margin: 0; color: #374151;"><strong>Files:</strong> ${attachedFiles.join(', ')}</p>` : ''}
              </div>
            </div>

            <!-- Plan Selected Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #06b6d4; padding-bottom: 8px;">🔹 Plan Selected</h2>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4;">
                <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">${planNames[submission.plan]}</p>
              </div>
            </div>

            <!-- Credential Sharing Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #84cc16; padding-bottom: 8px;">🔹 Credential Sharing</h2>
              <div style="background: #f7fee7; padding: 20px; border-radius: 8px; border-left: 4px solid #84cc16;">
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Option Chosen:</strong> ${submission.credential_sharing === 'sendsecurely' ? 'SendSecretly.ly' : submission.credential_sharing === 'call' ? 'Schedule Call' : 'Direct Submission'}</p>
                ${submission.credentials_direct ? `<p style="margin: 0; color: #374151;"><strong>Credentials:</strong> [Provided]</p>` : ''}
              </div>
            </div>

            <!-- FAQs Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #ec4899; padding-bottom: 8px;">🔹 FAQs</h2>
              <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899;">
                ${submission.faqFileUrl ? '<p style="margin: 0 0 8px 0; color: #374151;"><strong>File uploaded:</strong> ✅</p>' : '<p style="margin: 0 0 8px 0; color: #374151;"><strong>File uploaded:</strong> ❌</p>'}
                ${submission.faq_content ? `<p style="margin: 0; color: #374151;"><strong>Text:</strong> "${submission.faq_content.substring(0, 100)}${submission.faq_content.length > 100 ? '...' : ''}"</p>` : ''}
              </div>
            </div>

            <!-- Contact Email Section -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #6366f1; padding-bottom: 8px;">🔹 Contact Email</h2>
              <div style="background: #eef2ff; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
                <p style="margin: 0; color: #374151; font-weight: 600;">${submission.email}</p>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #dc2626; font-weight: 600; font-size: 16px;">⚠️ Action Required: Set up ${submission.business_name}'s account</p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function createEnhancedWelcomeEmail(submission: EnhancedFormSubmission): EmailTemplate {
  const planNames = {
    starter: 'Starter Plan',
    pro: 'Pro Plan', 
    pro_plus: 'Pro Plus Plan'
  }

  return {
    to: [submission.email],
    subject: '🎉 Welcome to AIChatFlows – Setup Started',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AIChatFlows</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to AIChatFlows!</h1>
            <p style="color: #e2e8f0; margin: 16px 0 0 0; font-size: 18px;">Thank you for submitting your onboarding form</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 20px;">
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">🚀 Your Setup is Starting</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">
                We've received your onboarding form for <strong>${submission.business_name}</strong> and our team is beginning the setup process for your AI-powered customer service solution.
              </p>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 32px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">📋 Next Steps</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Complete your payment to activate your account</li>
                <li>We'll prepare your social media integrations</li>
                <li>Receive your login credentials within 24 hours</li>
                <li>Start engaging with customers automatically!</li>
              </ul>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin: 32px 0;">
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">📊 Your Selected Plan</h3>
              <p style="color: #374151; margin: 0; font-size: 16px; font-weight: 600;">${planNames[submission.plan]}</p>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 32px 0;">
              <h3 style="color: #059669; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">✨ What We're Setting Up</h3>
              <ul style="color: #065f46; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Instagram integration for @${submission.instagram_handle}</li>
                <li>AI responses for ${submission.customer_questions.length} question types</li>
                <li>Menu and product information processing</li>
                ${submission.delivery_pickup !== 'neither' ? '<li>Delivery and pickup information setup</li>' : ''}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <p style="color: #6b7280; margin: 0; font-size: 16px;">
                Questions? We're here to help!
              </p>
              <p style="color: #3b82f6; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">
                📧 ${ADMIN_EMAIL}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 AIChatFlows. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

// Payment confirmation emails (Enhanced version)
export function createPaymentConfirmationClientEmail(submission: EnhancedFormSubmission | FormSubmission, stripeData?: Record<string, unknown>): EmailTemplate {
  const planPrices = {
    starter: '$100',
    pro: '$150', 
    pro_plus: '$200'
  }

  const planNames = {
    starter: 'Starter Plan',
    pro: 'Pro Plan', 
    pro_plus: 'Pro Plus Plan'
  }

  // Handle both enhanced and legacy submission types
  const businessName = 'business_name' in submission ? submission.business_name : submission.name
  const email = submission.email

  return {
    to: [email],
    subject: '🧾 Your AIChatFlows Payment Receipt',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Payment Confirmed! 🎉</h1>
            <p style="color: #d1fae5; margin: 16px 0 0 0; font-size: 18px;">Your AIChatFlows account is now active</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 20px;">
            
            <!-- Receipt Details -->
            <div style="background: #f0f9ff; border: 1px solid #c7d2fe; padding: 24px; border-radius: 8px; margin: 32px 0;">
              <h3 style="color: #1e40af; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">📋 Payment Details</h3>
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Business:</strong> ${businessName}</p>
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Plan:</strong> ${planNames[submission.plan]}</p>
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Amount:</strong> ${planPrices[submission.plan]}/month</p>
                <p style="margin: 0; color: #374151;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              ${stripeData?.id ? `<p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Transaction ID:</strong> ${stripeData.id}</p>` : ''}
            </div>

            <!-- What's Next -->
            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 32px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #059669; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">🚀 What's Next?</h3>
              <ul style="color: #065f46; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Our team is preparing your account setup</li>
                <li>You'll receive login credentials within 24 hours</li>
                <li>We'll configure your social media integrations</li>
                <li>Your AI assistant will start helping customers!</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <p style="color: #6b7280; margin: 0; font-size: 16px;">
                Questions about your payment or account?
              </p>
              <p style="color: #3b82f6; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">
                📧 ${ADMIN_EMAIL}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 AIChatFlows. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function createPaymentConfirmationAdminEmail(submission: EnhancedFormSubmission | FormSubmission, stripeData?: Record<string, unknown>): EmailTemplate {
  const planPrices = {
    starter: '$100',
    pro: '$150', 
    pro_plus: '$200'
  }

  const planNames = {
    starter: 'Starter Plan',
    pro: 'Pro Plan', 
    pro_plus: 'Pro Plus Plan'
  }

  // Handle both enhanced and legacy submission types
  const businessName = 'business_name' in submission ? submission.business_name : submission.name
  const email = submission.email

  return {
    to: [ADMIN_EMAIL],
    subject: `✅ Payment Received – ${businessName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Received</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✅ Payment Received</h1>
            <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px;">${businessName}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 20px;">
            
            <!-- Payment Info -->
            <div style="background: #f0f9ff; border: 1px solid #c7d2fe; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="color: #1e40af; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">💰 Payment Information</h3>
              <p style="margin: 0 0 8px 0; color: #374151;"><strong>Business:</strong> ${businessName}</p>
              <p style="margin: 0 0 8px 0; color: #374151;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0 0 8px 0; color: #374151;"><strong>Plan:</strong> ${planNames[submission.plan]}</p>
              <p style="margin: 0 0 8px 0; color: #374151;"><strong>Amount:</strong> ${planPrices[submission.plan]}</p>
              <p style="margin: 0 0 8px 0; color: #374151;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              ${stripeData?.id ? `<p style="margin: 0; color: #374151;"><strong>Stripe Transaction ID:</strong> ${stripeData.id}</p>` : ''}
            </div>

            <!-- Metadata -->
            ${stripeData && Object.keys(stripeData).length > 1 ? `
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">📊 Stripe Metadata</h3>
              <pre style="margin: 0; color: #6b7280; font-size: 12px; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(stripeData, null, 2)}</pre>
            </div>
            ` : ''}

            <!-- Action Required -->
            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 16px;">⚠️ Action Required: Begin account setup for ${businessName}</p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `,
  }
}

// Simple duplicate prevention using an in-memory store
// In production, you might want to use Redis or database
const emailSentStore = new Map<string, number>()

function createEmailKey(to: string, subject: string, type: 'form_submission' | 'payment_confirmation'): string {
  return `${type}:${to}:${subject.replace(/[^\w\s]/gi, '')}`
}

function isDuplicateEmail(key: string, cooldownMinutes: number = 5): boolean {
  const lastSent = emailSentStore.get(key)
  if (!lastSent) return false
  
  const cooldownMs = cooldownMinutes * 60 * 1000
  return Date.now() - lastSent < cooldownMs
}

function markEmailSent(key: string): void {
  emailSentStore.set(key, Date.now())
  
  // Clean up old entries (keep only last 24 hours)
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
  const keysToDelete: string[] = []
  
  emailSentStore.forEach((timestamp, k) => {
    if (timestamp < oneDayAgo) {
      keysToDelete.push(k)
    }
  })
  
  keysToDelete.forEach(k => emailSentStore.delete(k))
}

export async function sendEmailWithAttachments(template: EmailTemplate, attachments?: Array<{ filename: string; url: string }>, options?: { preventDuplicates?: boolean, emailType?: 'form_submission' | 'payment_confirmation' }) {
  try {
    // Duplicate prevention logic
    if (options?.preventDuplicates && options?.emailType) {
      const emailKey = createEmailKey(template.to[0], template.subject, options.emailType)
      
      if (isDuplicateEmail(emailKey)) {
        console.log(`Skipping duplicate email: ${template.subject} to ${template.to[0]}`)
        return { duplicate: true, skipped: true }
      }
      
      markEmailSent(emailKey)
    }

    const emailData: {
      from: string
      to: string[]
      subject: string
      html: string
      attachments?: Array<{ filename: string; content: string }>
    } = {
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
    }

    // Add attachments if provided (Resend supports attachments via URL)
    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.url // Resend can fetch from URL
      }))
    }

    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

export async function sendEmail(template: EmailTemplate, options?: { preventDuplicates?: boolean, emailType?: 'form_submission' | 'payment_confirmation' }) {
  try {
    // Duplicate prevention logic
    if (options?.preventDuplicates && options?.emailType) {
      const emailKey = createEmailKey(template.to[0], template.subject, options.emailType)
      
      if (isDuplicateEmail(emailKey)) {
        console.log(`Skipping duplicate email: ${template.subject} to ${template.to[0]}`)
        return { duplicate: true, skipped: true }
      }
      
      markEmailSent(emailKey)
    }

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