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
  menu_file: z.instanceof(File).optional(),
  additional_docs: z.array(z.instanceof(File)).optional(),
  
  // Plan Selection
  plan: z.enum(['starter', 'pro', 'pro_plus']),
  
  // Credential Sharing
  credential_sharing: z.enum(['direct', 'sendsecurely', 'call']),
  
  // FAQ Upload
  has_faqs: z.enum(['yes', 'no']),
  faq_file: z.instanceof(File).optional(),
  
  // Contact & Consent
  email: z.string().email('Please enter a valid email address'),
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

// Enhanced onboarding form schema for new requirements
export const enhancedOnboardingFormSchema = z.object({
  // Business Info
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name too long'),
  instagram_handle: z.string().min(1, 'Instagram handle is required').max(50, 'Instagram handle too long'),
  other_platforms: z.string().optional(),
  business_type: z.string().min(1, 'Please select a business type'),
  business_type_other: z.string().optional(),
  
  // Dynamic Product Categories
  product_categories: z.array(z.string()).min(1, 'Please select at least one product category'),
  product_categories_other: z.string().optional(),
  
  // Customer Questions
  customer_questions: z.array(z.string()).min(1, 'Please select at least one common question type'),
  customer_questions_other: z.string().optional(),
  
  // Delivery/Pickup
  delivery_pickup: z.enum(['delivery', 'pickup', 'both', 'neither']),
  delivery_options: z.array(z.string()).optional(),
  delivery_options_other: z.string().optional(),
  pickup_options: z.array(z.string()).optional(),
  pickup_options_other: z.string().optional(),
  delivery_notes: z.string().optional(),
  
  // Menu & Documentation
  menu_description: z.string().optional(),
  
  // Plan Selection
  plan: z.enum(['starter', 'pro', 'pro_plus']),
  
  // Credential Sharing
  credential_sharing: z.enum(['direct', 'sendsecurely', 'call']),
  credentials_direct: z.string().optional(),
  
  // FAQ Upload
  has_faqs: z.enum(['yes', 'no']),
  faq_content: z.string().optional(),
  
  // Contact & Consent
  email: z.string().email('Please enter a valid email address'),
  consent_checkbox: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine((data) => {
  // If business type is "other", business_type_other is required
  if (data.business_type === 'other' && !data.business_type_other?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please specify your business type',
  path: ['business_type_other']
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
  // If "Other" is selected in customer questions, other field is required
  if (data.customer_questions.includes('Other') && !data.customer_questions_other?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please specify the other question type',
  path: ['customer_questions_other']
}).refine((data) => {
  // If delivery is selected, at least one delivery option should be selected
  if ((data.delivery_pickup === 'delivery' || data.delivery_pickup === 'both') && 
      (!data.delivery_options || data.delivery_options.length === 0)) {
    return false
  }
  return true
}, {
  message: 'Please select at least one delivery option',
  path: ['delivery_options']
}).refine((data) => {
  // If pickup is selected, at least one pickup option should be selected
  if ((data.delivery_pickup === 'pickup' || data.delivery_pickup === 'both') && 
      (!data.pickup_options || data.pickup_options.length === 0)) {
    return false
  }
  return true
}, {
  message: 'Please select at least one pickup option',
  path: ['pickup_options']
}).refine((data) => {
  // If "Other" is selected in delivery options, other field is required
  if (data.delivery_options?.includes('Other') && !data.delivery_options_other?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please specify the other delivery option',
  path: ['delivery_options_other']
}).refine((data) => {
  // If "Other" is selected in pickup options, other field is required
  if (data.pickup_options?.includes('Other') && !data.pickup_options_other?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please specify the other pickup option',
  path: ['pickup_options_other']
}).refine((data) => {
  // If credential sharing is direct, credentials_direct is required
  if (data.credential_sharing === 'direct' && !data.credentials_direct?.trim()) {
    return false
  }
  return true
}, {
  message: 'Please provide your credentials',
  path: ['credentials_direct']
}).refine((data) => {
  // If has_faqs is yes, faq_content should be provided if no file is uploaded
  if (data.has_faqs === 'yes' && !data.faq_content?.trim()) {
    // Note: File validation will be handled separately as files aren't part of the schema
    return true // Allow for now, will be validated in the component
  }
  return true
}, {
  message: 'Please provide FAQ content or upload a file',
  path: ['faq_content']
})

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>
export type ClientOnboardingFormData = z.infer<typeof clientOnboardingFormSchema>
export type EnhancedOnboardingFormData = z.infer<typeof enhancedOnboardingFormSchema>
export type StripeWebhookPayload = z.infer<typeof stripeWebhookSchema>