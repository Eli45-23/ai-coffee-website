import type { NextPage } from 'next'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import PricingCard from '@/components/ui/PricingCard'
import Button from '@/components/ui/Button'
import { PricingPlan } from '@/types'
import { STRIPE_PRICES } from '@/lib/stripe'

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: STRIPE_PRICES.starter.amount,
    currency: STRIPE_PRICES.starter.currency,
    stripeUrl: 'https://buy.stripe.com/fZu5kEaZ4dQqbKUfNZ8Vi00',
    features: [
      'Instagram account management',
      'AI-powered content creation',
      'Basic analytics dashboard',
      'Email support',
      'Up to 30 posts per month',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: STRIPE_PRICES.pro.amount,
    currency: STRIPE_PRICES.pro.currency,
    stripeUrl: 'https://buy.stripe.com/3cI5kE7MS13EcOY6dp8Vi01',
    popular: true,
    features: [
      'All Starter features',
      'Multi-platform management (Instagram, Facebook, Twitter)',
      'Advanced AI content creation',
      'Detailed analytics & reporting',
      'Priority email support',
      'Up to 100 posts per month',
      'Custom hashtag strategies',
    ],
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: STRIPE_PRICES.pro_plus.amount,
    currency: STRIPE_PRICES.pro_plus.currency,
    stripeUrl: 'https://buy.stripe.com/28EeVe9V06nY4is59l8Vi02',
    features: [
      'All Pro features',
      'Full platform coverage (Instagram, Facebook, Twitter, LinkedIn, TikTok)',
      'Premium AI content creation',
      'White-label dashboard',
      'Phone & email support',
      'Unlimited posts',
      'Custom branding',
      'Advanced automation rules',
      'Dedicated account manager',
    ],
  },
]

const Home: NextPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient mb-6">
              AI-Powered Social Media
              <br />
              <span className="text-gray-900">Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automate your social media presence with intelligent content creation, 
              scheduling, and analytics. Let AI handle your posts while you focus on growing your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Today
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AIChatFlows?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform takes the complexity out of social media management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center animate-slide-up">
              <div className="w-12 h-12 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Content Creation</h3>
              <p className="text-gray-600">
                Generate engaging posts, captions, and hashtags automatically based on your brand voice and audience.
              </p>
            </div>

            <div className="card p-8 text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Scheduling</h3>
              <p className="text-gray-600">
                Optimize posting times based on your audience activity and platform algorithms for maximum engagement.
              </p>
            </div>

            <div className="card p-8 text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">
                Track performance, engagement, and growth across all platforms with detailed insights and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with any plan and upgrade as your business grows. All plans include AI-powered content creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Need a custom solution? We&apos;d love to help.
            </p>
            <a 
              href="mailto:admin@ai-chatflows.com" 
              className="text-gray-900 font-semibold hover:underline"
            >
              Contact us for enterprise pricing
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of businesses already using AIChatFlows to grow their online presence.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}

export default Home