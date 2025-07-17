import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AIChatFlows</span>
            </div>
            <p className="text-gray-600 text-sm">
              Automated social media management and content creation powered by AI.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/start" className="text-gray-600 hover:text-gray-900 text-sm">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:admin@ai-chatflows.com" className="text-gray-600 hover:text-gray-900 text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/legal" className="text-gray-600 hover:text-gray-900 text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <p className="text-gray-600 text-sm">
              Ready to automate your social media?
            </p>
            <Link href="/start" className="btn-primary mt-4 inline-block">
              Start Now
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 AIChatFlows. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}