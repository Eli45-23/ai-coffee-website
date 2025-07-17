import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingFormSchema, OnboardingFormData } from '@/lib/validations'
import { LOGIN_SHARING_OPTIONS, PricingTier } from '@/types'
import { getStripeCheckoutUrl } from '@/lib/stripe'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/ui/FileUpload'

interface OnboardingFormProps {
  initialPlan?: PricingTier
}

export default function OnboardingForm({ initialPlan = 'starter' }: OnboardingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Debug logging
  console.log('OnboardingForm rendered with initialPlan:', initialPlan)

  let form
  try {
    form = useForm<OnboardingFormData>({
      resolver: zodResolver(onboardingFormSchema),
      defaultValues: {
        plan: initialPlan,
        login_sharing_preference: 'secure_site',
      },
    })
  } catch (error) {
    console.error('Error initializing form:', error)
    return <div>Error loading form. Please refresh the page.</div>
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const watchedPlan = watch('plan')

  const getRequiredLoginFields = (plan: PricingTier) => {
    switch (plan) {
      case 'starter':
        return ['instagram_login']
      case 'pro':
        return ['instagram_login', 'facebook_login', 'twitter_login']
      case 'pro_plus':
        return ['instagram_login', 'facebook_login', 'twitter_login', 'linkedin_login', 'tiktok_login']
      default:
        return ['instagram_login']
    }
  }

  const requiredFields = getRequiredLoginFields(watchedPlan)

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value.toString())
        }
      })

      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to Stripe checkout with submission ID
        const checkoutUrl = getStripeCheckoutUrl(data.plan, result.submissionId)
        window.location.href = checkoutUrl
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Get Started with AIChatFlows
          </h1>
          <p className="text-gray-600">
            Fill out the form below and we&apos;ll set up your AI-powered social media management.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            
            <Input
              label="Full Name"
              {...register('name')}
              error={errors.name?.message}
              required
            />

            <Input
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              required
            />

            <Input
              label="Phone Number"
              {...register('phone')}
              error={errors.phone?.message}
              hint="Optional, but helps us provide better support"
            />

            <Input
              label="Company/Business Name"
              {...register('company')}
              error={errors.company?.message}
              hint="Optional"
            />
          </div>

          {/* Plan Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Plan Selection</h2>
            
            <Select
              label="Choose Your Plan"
              {...register('plan')}
              error={errors.plan?.message}
              required
            >
              <option value="starter">Starter - $29.97/month</option>
              <option value="pro">Pro - $49.97/month (Most Popular)</option>
              <option value="pro_plus">Pro Plus - $99.97/month</option>
            </Select>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                {watchedPlan === 'starter' && 'Starter Plan'}
                {watchedPlan === 'pro' && 'Pro Plan'}
                {watchedPlan === 'pro_plus' && 'Pro Plus Plan'}
              </h3>
              <p className="text-blue-700 text-sm">
                {watchedPlan === 'starter' && 'Perfect for individuals managing Instagram accounts.'}
                {watchedPlan === 'pro' && 'Ideal for small businesses managing multiple platforms.'}
                {watchedPlan === 'pro_plus' && 'Complete solution for agencies and large businesses.'}
              </p>
            </div>
          </div>

          {/* Social Media Logins */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Social Media Account Access</h2>
            <p className="text-gray-600 text-sm">
              Please provide login information for the social media accounts you&apos;d like us to manage.
              {watchedPlan === 'starter' && ' For the Starter plan, only Instagram is required.'}
            </p>

            <Input
              label="Instagram Login"
              {...register('instagram_login')}
              error={errors.instagram_login?.message}
              required={requiredFields.includes('instagram_login')}
              hint="Username or email used to log into Instagram"
            />

            {(watchedPlan === 'pro' || watchedPlan === 'pro_plus') && (
              <>
                <Input
                  label="Facebook Login"
                  {...register('facebook_login')}
                  error={errors.facebook_login?.message}
                  hint="Username or email used to log into Facebook"
                />

                <Input
                  label="Twitter/X Login"
                  {...register('twitter_login')}
                  error={errors.twitter_login?.message}
                  hint="Username or email used to log into Twitter/X"
                />
              </>
            )}

            {watchedPlan === 'pro_plus' && (
              <>
                <Input
                  label="LinkedIn Login"
                  {...register('linkedin_login')}
                  error={errors.linkedin_login?.message}
                  hint="Username or email used to log into LinkedIn"
                />

                <Input
                  label="TikTok Login"
                  {...register('tiktok_login')}
                  error={errors.tiktok_login?.message}
                  hint="Username or email used to log into TikTok"
                />
              </>
            )}

            <Select
              label="How would you like to share login credentials?"
              {...register('login_sharing_preference')}
              error={errors.login_sharing_preference?.message}
              required
            >
              {LOGIN_SHARING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
            
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              You&apos;ll be redirected to Stripe to complete your payment securely.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}