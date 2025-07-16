import Layout from '@/components/layout/Layout'

export default function LegalPage() {
  return (
    <Layout 
      title="Privacy Policy & Terms - AIChatFlows"
      description="Privacy policy and terms of service for AIChatFlows."
      showMobileCTA={false}
    >
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Privacy Policy & Terms of Service
            </h1>

            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy Policy</h2>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Information We Collect</h3>
                <p className="text-gray-700 mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  subscribe to our service, or contact us for support. This may include your name, 
                  email address, phone number, and social media account information.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Use Your Information</h3>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, send you technical notices and support messages, and communicate 
                  with you about products, services, and promotional offers.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Information Security</h3>
                <p className="text-gray-700 mb-6">
                  We take reasonable measures to help protect information about you from loss, theft, 
                  misuse, unauthorized access, disclosure, alteration, and destruction. However, no 
                  internet or email transmission is ever fully secure or error-free.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Terms of Service</h2>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Description</h3>
                <p className="text-gray-700 mb-4">
                  AIChatFlows provides AI-powered social media management services, including content 
                  creation, scheduling, and analytics. We manage your social media accounts according 
                  to your selected plan and preferences.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Responsibilities</h3>
                <p className="text-gray-700 mb-4">
                  You are responsible for providing accurate account information and maintaining the 
                  security of your account credentials. You must comply with all applicable laws and 
                  the terms of service of social media platforms.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Terms</h3>
                <p className="text-gray-700 mb-4">
                  Subscription fees are billed monthly in advance. All payments are processed securely 
                  through Stripe. Refunds may be available according to our refund policy.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                <p className="text-gray-700 mb-6">
                  Our liability is limited to the amount you paid for the service. We are not liable 
                  for any indirect, incidental, or consequential damages arising from your use of our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or Terms of Service, please contact us at{' '}
                  <a 
                    href="mailto:admin@ai-chatflows.com" 
                    className="text-gray-900 font-medium hover:underline"
                  >
                    admin@ai-chatflows.com
                  </a>
                </p>
                
                <p className="text-gray-500 text-sm mt-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}