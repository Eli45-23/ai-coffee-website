import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export default function ThankYouPage() {
  return (
    <Layout 
      title="Thank You - AIChatFlows"
      description="Thank you for your interest in AIChatFlows. We'll be in touch soon!"
      showMobileCTA={false}
    >
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <EnvelopeIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              We&apos;ve received your information and will be in touch with you shortly.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                What&apos;s Next?
              </h2>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Our team will review your submission
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  We&apos;ll reach out within 24 hours to discuss your needs
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  We&apos;ll provide a customized solution for your business
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  Return to Homepage
                </Button>
              </Link>
              
              <div className="text-sm text-gray-500">
                <p>Need immediate assistance? Contact us at{' '}
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