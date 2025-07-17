import type { NextPage } from 'next'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { PricingPlan } from '@/types'
import { STRIPE_PRICES } from '@/lib/stripe'
import { formatPrice } from '@/lib/stripe'

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: STRIPE_PRICES.starter.amount,
    currency: STRIPE_PRICES.starter.currency,
    stripeUrl: 'https://buy.stripe.com/fZu5kEaZ4dQqbKUfNZ8Vi00',
    features: [
      'Instagram Automation (AI Q&A Bot)',
      'Customer Support Chatbot',
      'Up to 500 contacts/month',
      'Email Support (24hr response)',
      'Full Setup & Deployment',
      'Multi-platform automation',
      'Advanced personalization',
      'Priority Support',
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
      'Everything in Starter',
      'TikTok, WhatsApp, Facebook automation',
      'Advanced bot personalization',
      'Up to 500 contacts/month',
      'Monthly performance reports',
      'Priority support (6hr response)',
      'Elite support & onboarding',
      '1-on-1 strategy calls',
    ],
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: STRIPE_PRICES.pro_plus.amount,
    currency: STRIPE_PRICES.pro_plus.currency,
    stripeUrl: 'https://buy.stripe.com/28EeVe9V06nY4is59l8Vi02',
    features: [
      'Everything in Pro',
      'Up to 1000 contacts/month',
      'Elite support & priority onboarding',
      'Custom integrations available',
      'Custom onboarding + in-person setup',
      'VIP client success support',
      '1-on-1 monthly strategy calls',
      'White-label chatbot option',
    ],
  },
]

const Home: NextPage = () => {
  return (
    <Layout showFooter={false}>
      {/* Hero Section - Dark Theme */}
      <section className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="text-teal-400">AI</span>ChatFlows
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Advanced AI Chatbots • Customer Service Automation
            </p>
            <Link href="/start">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold rounded-lg">
                SEE PLANS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-teal-400 mb-4">
              What We Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">24/7 AI Chatbot</h3>
              <p className="text-gray-300">
                Instant answers to customer questions across Instagram, Facebook, SMS & more.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Seamless Setup</h3>
              <p className="text-gray-300">
                No coding needed—deploy your branded bot in minutes and start automating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-blue-400 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Connect Your Channels</h3>
              <p className="text-gray-300">
                Securely link your Instagram, WhatsApp, TikTok, or Facebook accounts.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Customize Your AI</h3>
              <p className="text-gray-300">
                Set your brand voice, FAQs, and product info—no coding needed.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Automate and Grow</h3>
              <p className="text-gray-300">
                Let AI handle repetitive questions and boost your engagement 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-teal-400 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your customer service with AI automation that works 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={plan.id} className="bg-gray-900 rounded-xl p-8 relative border border-gray-700">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  {/* Plan Icons */}
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    {index === 0 && <div className="w-8 h-8 bg-amber-500 rounded-full"></div>}
                    {index === 1 && <div className="w-8 h-8 bg-yellow-400 rounded text-center flex items-center justify-center">⚡</div>}
                    {index === 2 && <div className="w-8 h-8 bg-blue-400 rounded text-center flex items-center justify-center">💎</div>}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  
                  {/* Setup Fee */}
                  {index === 0 && <p className="text-gray-400 text-sm mb-2">One-time Setup: $50</p>}
                  {index === 1 && <p className="text-gray-400 text-sm mb-2">One-time Setup: $50</p>}
                  {index === 2 && <p className="text-gray-400 text-sm mb-2">Setup Included FREE</p>}
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-gray-300">
                      <svg className="h-5 w-5 text-teal-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/start?plan=${plan.id}`} className="block w-full">
                  <Button 
                    className={`w-full py-3 rounded-lg font-semibold ${
                      plan.popular 
                        ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    CHOOSE {plan.name.toUpperCase()}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Businesses, Real Results Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-teal-400 mb-4">
              Real Businesses, Real Results
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Save 60+ hours every month</h3>
              <p className="text-gray-300">
                Let AI handle repetitive DMs so you can focus on growing your business and building meaningful customer relationships.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Respond instantly, 24/7</h3>
              <p className="text-gray-300">
                Never miss a message — customers get answers even at 2 AM. Your AI assistant never sleeps, ensuring zero response delays.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 bg-pink-400 rounded"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Cut down support load by 80%</h3>
              <p className="text-gray-300">
                Automate replies to your most common questions and FAQs, dramatically reducing manual customer service workload.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-teal-400 mb-4">AIChatFlows</h3>
          <p className="text-gray-300 mb-4">
            Revolutionizing customer interaction with advanced AI automation.
          </p>
          <div className="text-center">
            <h4 className="text-teal-400 font-semibold mb-2">Contact Us</h4>
            <a href="mailto:elisecore23@gmail.com" className="text-gray-300 hover:text-white">
              Email: elisecore23@gmail.com
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              © 2024 AIChatFlows. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link href="/legal" className="text-gray-500 hover:text-gray-400 text-sm">
                Privacy Policy
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/legal" className="text-gray-500 hover:text-gray-400 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Home