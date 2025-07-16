import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <Layout 
      title="Page Not Found - AIChatFlows"
      description="The page you're looking for doesn't exist."
      showMobileCTA={false}
    >
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-6xl font-bold text-gray-300 mb-6">404</div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>

            <div className="space-y-4">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  Return to Homepage
                </Button>
              </Link>
              
              <Link href="/onboarding">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto ml-0 sm:ml-4">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>Need help? Contact us at{' '}
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
    </Layout>
  )
}