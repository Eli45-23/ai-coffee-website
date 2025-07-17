import { z } from 'zod'

// Legacy onboarding form schema (keep for backward compatibility)
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

// New enhanced client onboarding form schema
export const clientOnboardingFormSchema = z.object({
  // Business Info
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name too long'),
  instagram_handle: z.string().min(1, 'Instagram handle is required').max(50, 'Instagram handle too long'),
  other_platforms: z.string().optional(),
  business_type: z.string().min(1, 'Business type is required').max(100, 'Business type too long'),
  
  // Product Categories
  product_categories: z.array(z.string()).min(1, 'Please select at least one product category'),
  product_categories_other: z.string().optional(),
  
  // Customer Questions
  common_questions: z.array(z.string()).min(1, 'Please select at least one common question type'),
  common_questions_other: z.string().optional(),
  
  // Delivery/Pickup
  delivery_option: z.enum(['delivery', 'pickup', 'both', 'neither']),
  
  // Menu Submission
  menu_text: z.string().optional(),
  
  // Plan Selection
  plan: z.enum(['starter', 'pro', 'pro_plus']),
  
  // Credential Sharing
  credential_sharing: z.enum(['direct', 'sendsecurely', 'call']),
  
  // FAQ Upload
  has_faqs: z.enum(['yes', 'no']),
  
  // Contact & Consent
  contact_email: z.string().email('Please enter a valid email address'),
  consent_checkbox: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine((data) => {
  // If "Other" is selected in product categories, other field is required
  if (data.product_categories.includes('Other') && !data.product_categories_other?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please specify the other product category',
  path: ['product_categories_other']
}).refine((data) => {
  // If "Other" is selected in common questions, other field is required
  if (data.common_questions.includes('Other') && !data.common_questions_other?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please specify the other question type',
  path: ['common_questions_other']
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
  const maxSize = 5 * 1024 * 1024 // 5MB for menu uploads
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
    return { valid: false, error: 'File size must be less than 5MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please upload images, PDFs, or documents.' }
  }
  
  return { valid: true }
}

// Helper function to validate menu files specifically
export function validateMenuFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
  ]
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Menu file size must be less than 5MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Menu files must be JPG, PNG, or PDF format' }
  }
  
  return { valid: true }
}

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>
export type ClientOnboardingFormData = z.infer<typeof clientOnboardingFormSchema>
export type StripeWebhookPayload = z.infer<typeof stripeWebhookSchema>