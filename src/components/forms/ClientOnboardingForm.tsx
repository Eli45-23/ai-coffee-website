import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { clientOnboardingFormSchema, ClientOnboardingFormData } from '@/lib/validations'
import { 
  PricingTier, 
  PRODUCT_CATEGORIES, 
  COMMON_QUESTIONS, 
  CREDENTIAL_SHARING_OPTIONS 
} from '@/types'
import FormInput from '@/components/ui/FormInput'
import FormTextarea from '@/components/ui/FormTextarea'
import FormCheckboxGroup from '@/components/ui/FormCheckboxGroup'
import FormRadioGroup from '@/components/ui/FormRadioGroup'
import FormFileUpload from '@/components/ui/FormFileUpload'
import FormSection from '@/components/ui/FormSection'

interface ClientOnboardingFormProps {
  initialPlan?: PricingTier
}

const deliveryOptions = [
  { value: 'delivery', label: 'Delivery only' },
  { value: 'pickup', label: 'Pickup only' },
  { value: 'both', label: 'Both delivery and pickup' },
  { value: 'neither', label: 'Neither (dine-in only)' }
]

const faqOptions = [
  { value: 'yes', label: 'Yes', description: 'I have existing FAQs to upload' },
  { value: 'no', label: 'No', description: 'Bot will learn from real customer chats' }
]

export default function ClientOnboardingForm({ initialPlan = 'starter' }: ClientOnboardingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientOnboardingFormData>({
    resolver: zodResolver(clientOnboardingFormSchema),
    defaultValues: {
      plan: initialPlan,
      product_categories: [],
      common_questions: [],
      delivery_option: 'both',
      credential_sharing: 'direct',
      has_faqs: 'no',
      consent_checkbox: false
    },
  })

  const watchedPlan = watch('plan')
  const watchedCredentialSharing = watch('credential_sharing')
  const watchedHasFaqs = watch('has_faqs')

  // Plan options with current pricing
  const planOptions = [
    {
      value: 'starter',
      label: 'Starter – $100/mo',
      description: 'Instagram automation, 500 contacts, $50 setup fee'
    },
    {
      value: 'pro', 
      label: 'Pro – $150/mo',
      description: 'All platforms, 500 contacts, $50 setup fee'
    },
    {
      value: 'pro_plus',
      label: 'Pro Plus – $200/mo', 
      description: 'All platforms, 1,000 contacts, no setup fee'
    }
  ]

  const onSubmit = async (data: ClientOnboardingFormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'product_categories' || key === 'common_questions') {
          // Handle arrays
          formData.append(key, JSON.stringify(value))
        } else if (key === 'menu_file' || key === 'faq_file' || key === 'additional_docs') {
          // Skip files - handle them separately
          return
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Add files
      if (data.menu_file) {
        formData.append('menu_file', data.menu_file)
      }
      if (data.faq_file) {
        formData.append('faq_file', data.faq_file)
      }
      if (data.additional_docs) {
        data.additional_docs.forEach((file: File, index: number) => {
          formData.append(`additional_docs_${index}`, file)
        })
      }

      const response = await fetch('/api/client-onboarding', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to success/payment page
        window.location.href = `/success?id=${result.submissionId}`
      } else {
        throw new Error(result.message || 'Failed to submit form')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('There was an error submitting your form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-8 lg:p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Start Your <span className="gradient-text">AI Setup</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Tell us about your business so we can create the perfect AI chatbot for you
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          
          {/* 1. Business Info */}
          <FormSection 
            title="Business Information"
            subtitle="Help us understand your business basics"
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
              label="Other Platforms to Integrate"
              {...register('other_platforms')}
              error={errors.other_platforms?.message}
              placeholder="Facebook, TikTok, WhatsApp, etc. (optional)"
              hint="List any other social media platforms you'd like to connect"
            />
            
            <FormInput
              label="Business Type or Niche"
              {...register('business_type')}
              error={errors.business_type?.message}
              placeholder="Restaurant, Retail Store, Service Business, etc."
              required
            />
          </FormSection>

          {/* 2. Product Categories */}
          <FormSection 
            title="Product or Service Categories"
            subtitle="What do you offer? (Select all that apply)"
          >
            <Controller
              name="product_categories"
              control={control}
              render={({ field }) => (
                <FormCheckboxGroup
                  label="Select your main categories"
                  options={PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
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
              <p className="text-sm text-red-400">{errors.product_categories_other.message}</p>
            )}
          </FormSection>

          {/* 3. Common Questions */}
          <FormSection 
            title="Common Customer Questions"
            subtitle="What do customers typically ask about? (Select all that apply)"
          >
            <Controller
              name="common_questions"
              control={control}
              render={({ field }) => (
                <FormCheckboxGroup
                  label="Select common question types"
                  options={COMMON_QUESTIONS.map(q => ({ value: q, label: q }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.common_questions?.message}
                  showOther={true}
                  otherValue={watch('common_questions_other') || ''}
                  onOtherChange={(value) => setValue('common_questions_other', value)}
                  otherPlaceholder="Specify other question types..."
                  required
                />
              )}
            />
            {errors.common_questions_other && (
              <p className="text-sm text-red-400">{errors.common_questions_other.message}</p>
            )}
          </FormSection>

          {/* 4. Delivery/Pickup */}
          <FormSection 
            title="Delivery & Pickup Options"
            subtitle="How do customers receive your products/services?"
          >
            <Controller
              name="delivery_option"
              control={control}
              render={({ field }) => (
                <FormRadioGroup
                  label="Select your service model"
                  options={deliveryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.delivery_option?.message}
                  name="delivery_option"
                  required
                />
              )}
            />
          </FormSection>

          {/* 5. Menu Submission */}
          <FormSection 
            title="Menu & Documentation"
            subtitle="Upload your menu, services list, or product catalog"
          >
            <Controller
              name="menu_file"
              control={control}
              render={({ field }) => (
                <FormFileUpload
                  label="Upload Menu/Services File"
                  onFileSelect={field.onChange}
                  selectedFile={field.value}
                  hint="Upload images, PDFs of your menu, services, or product catalog"
                />
              )}
            />
            
            <FormTextarea
              label="Menu/Services Text"
              {...register('menu_text')}
              error={errors.menu_text?.message}
              placeholder="Type or paste your menu, services list, pricing, etc."
              hint="You can type your offerings here instead of or in addition to uploading files"
              rows={6}
            />
            
            <Controller
              name="additional_docs"
              control={control}
              render={({ field }) => (
                <FormFileUpload
                  label="Additional Documents/Screenshots"
                  onFileSelect={(files) => field.onChange(files ? [files] : [])}
                  selectedFile={field.value?.[0]}
                  hint="Any additional documents, screenshots, or reference materials"
                  multiple={false}
                />
              )}
            />
          </FormSection>

          {/* 6. Plan Selection */}
          <FormSection 
            title="Choose Your Plan"
            subtitle="Select the package that fits your business needs"
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
          {watchedPlan && (
            <FormSection 
              title="Credential Sharing Method"
              subtitle="How would you like to share your social media login credentials?"
            >
              <Controller
                name="credential_sharing"
                control={control}
                render={({ field }) => (
                  <FormRadioGroup
                    label="Choose your preferred method"
                    options={CREDENTIAL_SHARING_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.credential_sharing?.message}
                    name="credential_sharing"
                    required
                  />
                )}
              />
              
              {watchedCredentialSharing === 'call' && (
                <div className="bg-[#10F2B0]/10 border border-[#10F2B0]/30 rounded-xl p-4">
                  <p className="text-[#10F2B0] font-medium">
                    📞 We&apos;ll email you to schedule a secure onboarding call
                  </p>
                </div>
              )}
            </FormSection>
          )}

          {/* 8. FAQ Upload */}
          <FormSection 
            title="Do You Have Existing FAQs?"
            subtitle="If you have a FAQ document, we can train your bot with it"
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
            )}
          </FormSection>

          {/* 9. Contact Email */}
          <FormSection 
            title="Contact Information"
            subtitle="How can we reach you for updates and support?"
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
                  I confirm that the information provided is accurate and I authorize AIChatFlows to begin setup automatically. I agree to the{' '}
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
                {isSubmitting ? '⏳ Processing...' : '✅ START MY SETUP'}
              </button>
              
              <div className="space-y-2">
                <p className="text-gray-400 text-sm flex items-center justify-center space-x-2">
                  <span>🔒</span>
                  <span>Your info is encrypted and secure.</span>
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