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

// Enhanced Onboarding Form Types
export interface EnhancedOnboardingFormData {
  // Business Info
  business_name: string
  instagram_handle: string
  other_platforms?: string
  business_type: string
  business_type_other?: string
  
  // Dynamic Product Categories
  product_categories: string[]
  product_categories_other?: string
  
  // Customer Questions
  customer_questions: string[]
  customer_questions_other?: string
  
  // Delivery/Pickup
  delivery_pickup: 'delivery' | 'pickup' | 'both' | 'neither'
  delivery_options?: string[]
  delivery_options_other?: string
  pickup_options?: string[]
  pickup_options_other?: string
  delivery_notes?: string
  
  // Menu & Documentation
  menu_file?: File
  additional_docs?: File[]
  menu_description?: string
  
  // Plan Selection
  plan: 'starter' | 'pro' | 'pro_plus'
  
  // Credential Sharing
  credential_sharing: 'direct' | 'sendsecurely' | 'call'
  credentials_direct?: string
  
  // FAQ Upload
  has_faqs: 'yes' | 'no'
  faq_file?: File
  faq_content?: string
  
  // Contact & Consent
  email: string
  consent_checkbox: boolean
}

// Business Types with Associated Categories
export interface BusinessTypeConfig {
  label: string
  categories: string[]
}

export const BUSINESS_TYPES: Record<string, BusinessTypeConfig> = {
  coffee_shop: {
    label: 'Coffee Shop',
    categories: ['Espresso Drinks', 'Cold Brew', 'Baked Goods', 'Breakfast Items', 'Sandwiches', 'Pastries']
  },
  deli: {
    label: 'Deli',
    categories: ['Sandwiches', 'Salads', 'Soups', 'Hot Foods', 'Cold Cuts', 'Sides']
  },
  pizzeria: {
    label: 'Pizzeria',
    categories: ['Pizza', 'Calzones', 'Wings', 'Salads', 'Pasta', 'Appetizers']
  },
  ice_cream_shop: {
    label: 'Ice Cream Shop',
    categories: ['Ice Cream', 'Frozen Yogurt', 'Milkshakes', 'Sundaes', 'Cakes', 'Toppings']
  },
  sandwich_shop: {
    label: 'Sandwich Shop',
    categories: ['Hot Sandwiches', 'Cold Sandwiches', 'Wraps', 'Salads', 'Soups', 'Sides']
  },
  juice_bar: {
    label: 'Juice Bar',
    categories: ['Fresh Juices', 'Smoothies', 'Bowls', 'Shots', 'Cleanses', 'Snacks']
  },
  restaurant: {
    label: 'Restaurant',
    categories: ['Appetizers', 'Entrees', 'Desserts', 'Beverages', 'Wine', 'Cocktails']
  },
  food_truck: {
    label: 'Food Truck',
    categories: ['Main Items', 'Sides', 'Beverages', 'Desserts', 'Daily Specials']
  },
  bakery: {
    label: 'Bakery',
    categories: ['Bread', 'Pastries', 'Cakes', 'Cookies', 'Muffins', 'Custom Orders']
  },
  clothing_store: {
    label: 'Clothing Store',
    categories: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes']
  },
  beauty_salon: {
    label: 'Beauty Salon',
    categories: ['Hair Services', 'Coloring', 'Styling', 'Treatments', 'Extensions', 'Consultations']
  },
  nail_spa: {
    label: 'Nail Spa',
    categories: ['Manicures', 'Pedicures', 'Nail Art', 'Gel Services', 'Treatments', 'Add-ons']
  },
  gym: {
    label: 'Gym',
    categories: ['Memberships', 'Personal Training', 'Classes', 'Equipment Access', 'Nutrition', 'Programs']
  }
}

// Common Customer Questions
export const CUSTOMER_QUESTIONS = [
  'What are your hours?',
  'Where are you located?',
  'Do you deliver?',
  'What\'s on your menu?',
  'Do you accept reservations?',
  'Do you have parking?',
  'Do you accept payment apps?'
]

// Delivery Options
export const DELIVERY_OPTIONS = [
  'Uber Eats',
  'DoorDash',
  'Grubhub',
  'In-house delivery'
]

// Pickup Options
export const PICKUP_OPTIONS = [
  'Curbside Pickup',
  'Walk-in Pickup'
]