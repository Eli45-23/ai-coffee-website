import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function SuccessPage() {
  return (
    <Layout 
      title="Payment Successful - AIChatFlows"
      description="Your payment has been processed successfully. Welcome to AIChatFlows!"
      showMobileCTA={false}
    >
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Welcome to AIChatFlows! Your account has been activated and you&apos;re all set.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-green-900 mb-3">
                What happens next?
              </h2>
              <ul className="text-left space-y-2 text-green-700">
                <li className="flex items-start">
                  <span className="font-medium mr-2">1.</span>
                  Our team will review your social media account information
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">2.</span>
                  We&apos;ll set up your AI-powered content creation system
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">3.</span>
                  You&apos;ll receive login credentials and setup instructions within 24 hours
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">4.</span>
                  Your automated social media management will begin!
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">
                Check your email
              </h3>
              <p className="text-blue-700">
                We&apos;ve sent you a confirmation email with your order details and next steps. 
                If you don&apos;t see it, please check your spam folder.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  Return to Homepage
                </Button>
              </Link>
              
              <div className="text-sm text-gray-500">
                <p>Questions? Email us at{' '}
                  <a 
                    href="mailto:admin@ai-chatflows.com" 
                    className="text-gray-900 font-medium hover:underline"
                  >
                    admin@ai-chatflows.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}