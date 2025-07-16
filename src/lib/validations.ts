import { z } from 'zod'

export const onboardingFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  plan: z.enum(['starter', 'pro', 'pro_plus']),
  instagram_login: z.string().optional(),
  facebook_login: z.string().optional(), 
  twitter_login: z.string().optional(),
  linkedin_login: z.string().optional(),
  tiktok_login: z.string().optional(),
  login_sharing_preference: z.enum([
    'secure_site',
    'in_person_setup', 
    'email_encrypted',
    'phone_call'
  ]),
}).refine((data) => {
  // For starter plan, only Instagram is required
  if (data.plan === 'starter') {
    return !!data.instagram_login?.trim()
  }
  
  // For pro and pro_plus plans, at least one social login is required
  const hasAtLeastOneLogin = [
    data.instagram_login,
    data.facebook_login,
    data.twitter_login,
    data.linkedin_login,
    data.tiktok_login,
  ].some(login => !!login?.trim())
  
  return hasAtLeastOneLogin
}, {
  message: 'At least one social media login is required for your selected plan',
  path: ['instagram_login'], // Show error on first field
})

export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.object({
      id: z.string(),
      client_reference_id: z.string().optional(),
      customer: z.string().optional(),
      payment_intent: z.string().optional(),
      payment_status: z.enum(['paid', 'unpaid']),
    }),
  }),
})

export const emailTemplateSchema = z.object({
  to: z.array(z.string().email()),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'Email content is required'),
})

// Helper function to validate file uploads
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please upload images, PDFs, or documents.' }
  }
  
  return { valid: true }
}

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>
export type StripeWebhookPayload = z.infer<typeof stripeWebhookSchema>