import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { enhancedOnboardingFormSchema } from '@/lib/validations'
import { 
  EnhancedOnboardingFormData,
  BUSINESS_TYPES,
  CUSTOMER_QUESTIONS,
  DELIVERY_OPTIONS,
  PICKUP_OPTIONS
} from '@/types'
import { getStripeCheckoutUrl } from '@/lib/stripe'
import FormInput from '@/components/ui/FormInput'
import FormTextarea from '@/components/ui/FormTextarea'
import FormDropdown from '@/components/ui/FormDropdown'
import ConditionalCheckboxGroup from '@/components/ui/ConditionalCheckboxGroup'
import FormRadioGroup from '@/components/ui/FormRadioGroup'
import FormFileUpload from '@/components/ui/FormFileUpload'
import FormSection from '@/components/ui/FormSection'

interface EnhancedOnboardingFormProps {
  initialPlan?: 'starter' | 'pro' | 'pro_plus'
}

export default function EnhancedOnboardingForm({ initialPlan = 'starter' }: EnhancedOnboardingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnhancedOnboardingFormData>({
    resolver: zodResolver(enhancedOnboardingFormSchema),
    defaultValues: {
      business_type: '',
      product_categories: [],
      customer_questions: [],
      delivery_pickup: 'both',
      delivery_options: [],
      pickup_options: [],
      plan: initialPlan,
      credential_sharing: 'sendsecurely',
      has_faqs: 'no',
      consent_checkbox: false
    },
  })

  // Watch form values for conditional logic
  const watchedBusinessType = watch('business_type')
  const watchedDeliveryPickup = watch('delivery_pickup')
  const watchedCredentialSharing = watch('credential_sharing')
  const watchedHasFaqs = watch('has_faqs')

  // Business type options
  const businessTypeOptions = [
    ...Object.entries(BUSINESS_TYPES).map(([value, config]) => ({
      value,
      label: config.label
    })),
    { value: 'other', label: 'Other' }
  ]

  // Dynamic product categories based on selected business type
  const getProductCategories = () => {
    if (!watchedBusinessType || watchedBusinessType === 'other') {
      return []
    }
    const businessConfig = BUSINESS_TYPES[watchedBusinessType]
    return businessConfig ? businessConfig.categories.map(cat => ({ value: cat, label: cat })) : []
  }

  // Customer questions options
  const customerQuestionsOptions = CUSTOMER_QUESTIONS.map(q => ({ value: q, label: q }))

  // Delivery options
  const deliveryOptionsData = DELIVERY_OPTIONS.map(option => ({ value: option, label: option }))

  // Pickup options
  const pickupOptionsData = PICKUP_OPTIONS.map(option => ({ value: option, label: option }))

  // Plan options
  const planOptions = [
    { value: 'starter', label: 'Starter Plan – $100', description: 'Perfect for small businesses getting started with AI automation' },
    { value: 'pro', label: 'Pro Plan – $150', description: 'Enhanced features for growing businesses' },
    { value: 'pro_plus', label: 'Pro Plus Plan – $200', description: 'Complete solution for established businesses' }
  ]

  // Credential sharing options
  const credentialSharingOptions = [
    { value: 'direct', label: 'Submit Credentials Directly', description: 'Enter your credentials in a secure form field below' },
    { value: 'sendsecurely', label: 'Use SendSecretly.ly', description: 'We\'ll email you a secure form link to upload your credentials safely' },
    { value: 'call', label: 'Schedule Onboarding Call', description: 'We\'ll schedule a call to walk through the setup process together' }
  ]

  // FAQ options
  const faqOptions = [
    { value: 'yes', label: 'Yes', description: 'I have existing FAQs to upload' },
    { value: 'no', label: 'No', description: 'The bot will learn from real customer interactions' }
  ]

  const onSubmit = async (data: EnhancedOnboardingFormData) => {
    setIsSubmitting(true)

    try {
      console.log('🚀 Starting form submission with server-side file upload')

      // Step 1: Create FormData to send all data and files to the API
      const formData = new FormData()

      // Add all form fields
      formData.append('business_name', data.business_name)
      formData.append('email', data.email)
      formData.append('instagram_handle', data.instagram_handle)
      if (data.other_platforms) formData.append('other_platforms', data.other_platforms)
      formData.append('business_type', data.business_type)
      if (data.business_type_other) formData.append('business_type_other', data.business_type_other)
      
      // Handle arrays for product categories and customer questions
      data.product_categories.forEach(category => {
        formData.append('product_categories', category)
      })
      if (data.product_categories_other) formData.append('product_categories_other', data.product_categories_other)
      
      data.customer_questions.forEach(question => {
        formData.append('customer_questions', question)
      })
      if (data.customer_questions_other) formData.append('customer_questions_other', data.customer_questions_other)

      // Add delivery/pickup fields
      formData.append('delivery_pickup', data.delivery_pickup)
      if (data.delivery_options) {
        data.delivery_options.forEach(option => {
          formData.append('delivery_options', option)
        })
      }
      if (data.delivery_options_other) formData.append('delivery_options_other', data.delivery_options_other)
      if (data.pickup_options) {
        data.pickup_options.forEach(option => {
          formData.append('pickup_options', option)
        })
      }
      if (data.pickup_options_other) formData.append('pickup_options_other', data.pickup_options_other)
      if (data.delivery_notes) formData.append('delivery_notes', data.delivery_notes)

      // Add menu and FAQ fields
      if (data.menu_description) formData.append('menu_description', data.menu_description)
      formData.append('plan', data.plan)
      formData.append('credential_sharing', data.credential_sharing)
      if (data.credentials_direct) formData.append('credentials_direct', data.credentials_direct)
      formData.append('has_faqs', data.has_faqs)
      if (data.faq_content) formData.append('faq_content', data.faq_content)
      formData.append('consent_checkbox', data.consent_checkbox.toString())

      // Add files (let the server handle the uploads)
      if (data.menu_file) {
        formData.append('menu_file', data.menu_file)
        console.log('📎 Menu file added to form data:', data.menu_file.name)
      }
      if (data.faq_file) {
        formData.append('faq_file', data.faq_file)
        console.log('📎 FAQ file added to form data:', data.faq_file.name)
      }
      if (data.additional_docs && data.additional_docs.length > 0) {
        data.additional_docs.forEach((file, index) => {
          formData.append('additional_docs', file)
          console.log(`📎 Additional document ${index + 1} added to form data:`, file.name)
        })
      }

      console.log('📤 Sending form data to server for processing')

      // Step 2: Submit everything to the API (file upload + database save + emails)
      const response = await fetch('/api/enhanced-onboarding', {
        method: 'POST',
        body: formData, // Send FormData (not JSON)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to submit form')
      }

      const result = await response.json()
      console.log('✅ Server response:', result)

      // Step 3: Redirect to Stripe checkout with submission ID for tracking
      const checkoutUrl = getStripeCheckoutUrl(data.plan, result.submissionId)
      if (checkoutUrl) {
        console.log('🔄 Redirecting to Stripe checkout')
        window.location.href = checkoutUrl
      } else {
        throw new Error('Invalid plan selected')
      }

    } catch (error) {
      console.error('❌ Form submission error:', error)
      alert(`There was an error submitting your form: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-8 lg:p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Start Your <span className="gradient-text">AI Journey</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Let&apos;s create the perfect AI chatbot for your business
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          
          {/* 1. Business Info Section */}
          <FormSection 
            title="Business Information"
            subtitle="Tell us about your business"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormInput
                label="Business Name"
                {...register('business_name')}
                error={errors.business_name?.message}
                placeholder="Your Business Name"
                required
              />
              
              <FormInput
                label="Instagram Handle"
                {...register('instagram_handle')}
                error={errors.instagram_handle?.message}
                placeholder="@yourbusiness"
                required
              />
            </div>
            
            <FormInput
              label="Other Platforms"
              {...register('other_platforms')}
              error={errors.other_platforms?.message}
              placeholder="Facebook, TikTok, WhatsApp, etc."
              hint="List any other social media platforms you use"
            />
            
            <Controller
              name="business_type"
              control={control}
              render={({ field }) => (
                <FormDropdown
                  label="Business Type or Niche"
                  options={businessTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.business_type?.message}
                  placeholder="Select your business type..."
                  required
                />
              )}
            />

            {watchedBusinessType === 'other' && (
              <div className="animate-fade-in">
                <FormInput
                  label="Please specify your business type"
                  {...register('business_type_other')}
                  error={errors.business_type_other?.message}
                  placeholder="Enter your business type"
                  required
                />
              </div>
            )}
          </FormSection>

          {/* 2. Dynamic Product Categories */}
          {watchedBusinessType && watchedBusinessType !== 'other' && (
            <FormSection 
              title="Product or Service Categories"
              subtitle={`What does your ${BUSINESS_TYPES[watchedBusinessType]?.label.toLowerCase()} offer?`}
            >
              <Controller
                name="product_categories"
                control={control}
                render={({ field }) => (
                  <ConditionalCheckboxGroup
                    label="Select your main categories"
                    options={getProductCategories()}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.product_categories?.message}
                    showOther={true}
                    otherValue={watch('product_categories_other') || ''}
                    onOtherChange={(value) => setValue('product_categories_other', value)}
                    otherPlaceholder="Specify your other category..."
                    required
                  />
                )}
              />
              {errors.product_categories_other && (
                <p className="text-sm text-red-400 mt-2">{errors.product_categories_other.message}</p>
              )}
            </FormSection>
          )}

          {/* 3. Customer Questions */}
          <FormSection 
            title="Most Common Customer Questions"
            subtitle="What do customers typically ask about?"
          >
            <Controller
              name="customer_questions"
              control={control}
              render={({ field }) => (
                <ConditionalCheckboxGroup
                  label="Select common question types"
                  options={customerQuestionsOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.customer_questions?.message}
                  showOther={true}
                  otherValue={watch('customer_questions_other') || ''}
                  onOtherChange={(value) => setValue('customer_questions_other', value)}
                  otherPlaceholder="Specify other question types..."
                  required
                />
              )}
            />
            {errors.customer_questions_other && (
              <p className="text-sm text-red-400 mt-2">{errors.customer_questions_other.message}</p>
            )}
          </FormSection>

          {/* 4. Delivery/Pickup Options */}
          <FormSection 
            title="Delivery & Pickup Options"
            subtitle="How do customers receive your products/services?"
          >
            <Controller
              name="delivery_pickup"
              control={control}
              render={({ field }) => (
                <FormRadioGroup
                  label="Select your service model"
                  options={[
                    { value: 'delivery', label: 'Delivery' },
                    { value: 'pickup', label: 'Pickup' },
                    { value: 'both', label: 'Both' },
                    { value: 'neither', label: 'Neither' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.delivery_pickup?.message}
                  name="delivery_pickup"
                  required
                />
              )}
            />

            {/* Conditional Delivery Options */}
            {(watchedDeliveryPickup === 'delivery' || watchedDeliveryPickup === 'both') && (
              <div className="animate-fade-in">
                <Controller
                  name="delivery_options"
                  control={control}
                  render={({ field }) => (
                    <ConditionalCheckboxGroup
                      label="Delivery Methods"
                      options={deliveryOptionsData}
                      value={field.value || []}
                      onChange={field.onChange}
                      error={errors.delivery_options?.message}
                      showOther={true}
                      otherValue={watch('delivery_options_other') || ''}
                      onOtherChange={(value) => setValue('delivery_options_other', value)}
                      otherPlaceholder="Specify other delivery method..."
                      required
                    />
                  )}
                />
                {errors.delivery_options_other && (
                  <p className="text-sm text-red-400 mt-2">{errors.delivery_options_other.message}</p>
                )}
              </div>
            )}

            {/* Conditional Pickup Options */}
            {(watchedDeliveryPickup === 'pickup' || watchedDeliveryPickup === 'both') && (
              <div className="animate-fade-in">
                <Controller
                  name="pickup_options"
                  control={control}
                  render={({ field }) => (
                    <ConditionalCheckboxGroup
                      label="Pickup Methods"
                      options={pickupOptionsData}
                      value={field.value || []}
                      onChange={field.onChange}
                      error={errors.pickup_options?.message}
                      showOther={true}
                      otherValue={watch('pickup_options_other') || ''}
                      onOtherChange={(value) => setValue('pickup_options_other', value)}
                      otherPlaceholder="Specify other pickup method..."
                      required
                    />
                  )}
                />
                {errors.pickup_options_other && (
                  <p className="text-sm text-red-400 mt-2">{errors.pickup_options_other.message}</p>
                )}
              </div>
            )}

            <FormTextarea
              label="Additional Notes"
              {...register('delivery_notes')}
              error={errors.delivery_notes?.message}
              placeholder="Any additional delivery or pickup information..."
              hint="Optional: Special instructions, hours, locations, etc."
              rows={3}
            />
          </FormSection>

          {/* 5. Menu & Documentation */}
          <FormSection 
            title="Menu & Documentation"
            subtitle="Upload your menu, services, or product information"
          >
            <Controller
              name="menu_file"
              control={control}
              render={({ field }) => (
                <FormFileUpload
                  label="Upload Menu"
                  onFileSelect={field.onChange}
                  selectedFile={field.value}
                  hint="Upload images or PDFs of your menu, services, or product catalog"
                />
              )}
            />
            
            <Controller
              name="additional_docs"
              control={control}
              render={({ field }) => (
                <FormFileUpload
                  label="Upload Additional Documents"
                  onFileSelect={(files) => field.onChange(files ? [files] : [])}
                  selectedFile={field.value?.[0]}
                  hint="Any additional documents, price lists, or reference materials"
                  multiple={false}
                />
              )}
            />
            
            <FormTextarea
              label="Menu Description"
              {...register('menu_description')}
              error={errors.menu_description?.message}
              placeholder="Describe your menu, services, pricing, or key offerings..."
              hint="You can type your menu/services information here instead of or in addition to uploading files"
              rows={6}
            />
          </FormSection>

          {/* 6. Plan Selection */}
          <FormSection 
            title="Plan Selection"
            subtitle="Choose the package that fits your needs"
          >
            <Controller
              name="plan"
              control={control}
              render={({ field }) => (
                <FormRadioGroup
                  label="Select your plan"
                  options={planOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.plan?.message}
                  name="plan"
                  required
                />
              )}
            />
          </FormSection>

          {/* 7. Credential Sharing */}
          <FormSection 
            title="Credential Sharing Method"
            subtitle="How would you like to share your social media credentials?"
          >
            <Controller
              name="credential_sharing"
              control={control}
              render={({ field }) => (
                <FormRadioGroup
                  label="Choose your preferred method"
                  options={credentialSharingOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.credential_sharing?.message}
                  name="credential_sharing"
                  required
                />
              )}
            />
            
            {watchedCredentialSharing === 'direct' && (
              <div className="animate-fade-in">
                <FormTextarea
                  label="Social Media Credentials"
                  {...register('credentials_direct')}
                  error={errors.credentials_direct?.message}
                  placeholder="Please provide your social media login information..."
                  hint="This information is encrypted and stored securely"
                  rows={4}
                  required
                />
              </div>
            )}

            {watchedCredentialSharing === 'sendsecurely' && (
              <div className="bg-[#10F2B0]/10 border border-[#10F2B0]/30 rounded-xl p-4 animate-fade-in">
                <p className="text-[#10F2B0] font-medium">
                  📧 We&apos;ll email you a secure form link to upload your credentials safely.
                </p>
              </div>
            )}
          </FormSection>

          {/* 8. FAQ Upload */}
          <FormSection 
            title="Do You Have Existing FAQs?"
            subtitle="If you have FAQs, we can train your bot with them"
          >
            <Controller
              name="has_faqs"
              control={control}
              render={({ field }) => (
                <FormRadioGroup
                  label="FAQ availability"
                  options={faqOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.has_faqs?.message}
                  name="has_faqs"
                  required
                />
              )}
            />
            
            {watchedHasFaqs === 'yes' && (
              <div className="space-y-6 animate-fade-in">
                <Controller
                  name="faq_file"
                  control={control}
                  render={({ field }) => (
                    <FormFileUpload
                      label="Upload FAQ Document"
                      onFileSelect={field.onChange}
                      selectedFile={field.value}
                      hint="Upload your existing FAQ document (PDF, Word, or image)"
                    />
                  )}
                />

                <FormTextarea
                  label="FAQ Content"
                  {...register('faq_content')}
                  error={errors.faq_content?.message}
                  placeholder="Paste your FAQ content here..."
                  hint="You can paste your FAQs here instead of or in addition to uploading a file"
                  rows={8}
                />
              </div>
            )}
          </FormSection>

          {/* 9. Email */}
          <FormSection 
            title="Email for Updates & Support"
            subtitle="How can we reach you?"
          >
            <FormInput
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="your@email.com"
              required
            />
          </FormSection>

          {/* 10. Consent */}
          <FormSection 
            title="Terms & Consent"
            subtitle="Please review and agree to proceed"
          >
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('consent_checkbox')}
                  className="
                    w-5 h-5 mt-1 rounded border-2 border-[#333333] 
                    bg-[#1a1a1a] text-[#10F2B0]
                    focus:ring-2 focus:ring-[#10F2B0] focus:ring-offset-0
                    transition-all duration-200
                  "
                />
                <div className="text-gray-300 leading-relaxed">
                  I agree to the terms and allow my data to be stored securely. I have read and agree to the{' '}
                  <Link href="/legal" className="text-[#10F2B0] hover:text-[#10F2B0]/80 transition-colors">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/legal" className="text-[#10F2B0] hover:text-[#10F2B0]/80 transition-colors">
                    Terms of Service
                  </Link>.
                </div>
              </label>
              {errors.consent_checkbox && (
                <p className="text-sm text-red-400">{errors.consent_checkbox.message}</p>
              )}
            </div>
          </FormSection>

          {/* 11. Submit Button */}
          <div className="pt-8 border-t border-[#333333]">
            <div className="text-center space-y-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#10F2B0] to-[#00BDFD] text-white font-semibold px-8 py-4 rounded-full shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? '⏳ Processing...' : 'Start My Setup'}
              </button>
              
              <div className="space-y-2">
                <p className="text-gray-400 text-sm flex items-center justify-center space-x-2">
                  <span>🔒</span>
                  <span>Your information is encrypted and secure.</span>
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Link href="/legal" className="text-[#10F2B0] hover:text-[#10F2B0]/80 transition-colors">
                    Privacy Policy
                  </Link>
                  <span className="text-gray-500">•</span>
                  <Link href="/legal" className="text-[#10F2B0] hover:text-[#10F2B0]/80 transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}