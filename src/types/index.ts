export type PricingTier = 'starter' | 'pro' | 'pro_plus'

export interface PricingPlan {
  id: PricingTier
  name: string
  price: number
  currency: string
  features: string[]
  popular?: boolean
  stripeUrl: string
}

// Legacy form data (keep for backward compatibility)
export interface FormData {
  name: string
  email: string
  phone?: string
  company?: string
  plan: PricingTier
  instagram_login?: string
  facebook_login?: string
  twitter_login?: string
  linkedin_login?: string
  tiktok_login?: string
  login_sharing_preference: string
  file?: File
}

// New enhanced onboarding form data
export interface OnboardingFormData {
  // Business Info
  business_name: string
  instagram_handle: string
  other_platforms?: string
  business_type: string
  
  // Product Categories
  product_categories: string[]
  product_categories_other?: string
  
  // Customer Questions
  common_questions: string[]
  common_questions_other?: string
  
  // Delivery/Pickup
  delivery_option: 'delivery' | 'pickup' | 'both' | 'neither'
  
  // Menu Submission
  menu_file?: File
  menu_text?: string
  additional_docs?: File[]
  
  // Plan Selection
  plan: PricingTier
  
  // Credential Sharing
  credential_sharing: 'direct' | 'sendsecurely' | 'call'
  
  // FAQ Upload
  has_faqs: 'yes' | 'no'
  faq_file?: File
  
  // Contact & Consent
  contact_email: string
  consent_checkbox: boolean
}

export interface ClientOnboardingSubmission {
  id?: string
  business_name: string
  instagram_handle: string
  other_platforms?: string
  business_type: string
  product_categories: string[]
  product_categories_other?: string
  common_questions: string[]
  common_questions_other?: string
  delivery_option: string
  menu_file_url?: string
  menu_text?: string
  additional_docs_urls?: string[]
  plan: PricingTier
  credential_sharing: string
  has_faqs: string
  faq_file_url?: string
  contact_email: string
  consent_checkbox: boolean
  source: string
  payment_status: 'pending' | 'completed'
  stripe_session_id?: string
  created_at?: string
}

export interface FormSubmissionResponse {
  success: boolean
  submissionId?: string
  message: string
  error?: string
}

export interface StripeWebhookData {
  event: string
  sessionId: string
  customerId?: string
  paymentIntentId?: string
}

export type LoginSharingOption = 
  | 'secure_site'
  | 'in_person_setup'
  | 'email_encrypted'
  | 'phone_call'

export const LOGIN_SHARING_OPTIONS: { value: LoginSharingOption; label: string }[] = [
  { value: 'secure_site', label: 'Via secure password sharing site' },
  { value: 'in_person_setup', label: 'Request in-person setup call' },
  { value: 'email_encrypted', label: 'Encrypted email delivery' },
  { value: 'phone_call', label: 'Phone call walkthrough' },
]

// Product/Service Categories
export const PRODUCT_CATEGORIES = [
  'Appetizers',
  'Entrées', 
  'Desserts',
  'Beverages',
  'Catering'
]

// Common Customer Questions
export const COMMON_QUESTIONS = [
  'Hours',
  'Menu items',
  'Delivery',
  'Reservations',
  'Parking',
  'Stock',
  'Payment'
]

// Credential Sharing Options
export const CREDENTIAL_SHARING_OPTIONS = [
  { value: 'direct', label: 'Submit credentials directly' },
  { value: 'sendsecurely', label: 'Use SendSecure.ly' },
  { value: 'call', label: 'Schedule onboarding call' }
]