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