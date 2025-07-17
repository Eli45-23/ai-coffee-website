import type { NextPage } from 'next'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { PricingPlan } from '@/types'
import { formatPrice } from '@/lib/stripe'

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 10000, // $100
    currency: 'usd',
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
    price: 15000, // $150
    currency: 'usd',
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
    price: 20000, // $200
    currency: 'usd',
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
      <section className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span style={{color: '#00d4aa'}}>AI</span>ChatFlows
            </h1>
            <p className="text-xl sm:text-2xl mb-12 max-w-2xl mx-auto" style={{color: '#e5e5e5'}}>
              Advanced AI Chatbots • Customer Service Automation
            </p>
            <Link href="/start">
              <button className="btn-primary px-8 py-4 text-lg font-semibold rounded-lg">
                SEE PLANS
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{color: '#00d4aa'}}>
              What We Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <h3 className="text-2xl font-bold text-white mb-4">24/7 AI Chatbot</h3>
              <p style={{color: '#e5e5e5'}}>
                Instant answers to customer questions across Instagram, Facebook, SMS & more.
              </p>
            </div>

            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <h3 className="text-2xl font-bold text-white mb-4">Seamless Setup</h3>
              <p style={{color: '#e5e5e5'}}>
                No coding needed—deploy your branded bot in minutes and start automating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{color: '#3b82f6'}}>
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{backgroundColor: '#00d4aa'}}>
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Connect Your Channels</h3>
              <p style={{color: '#e5e5e5'}}>
                Securely link your Instagram, WhatsApp, TikTok, or Facebook accounts.
              </p>
            </div>

            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{backgroundColor: '#00d4aa'}}>
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Customize Your AI</h3>
              <p style={{color: '#e5e5e5'}}>
                Set your brand voice, FAQs, and product info—no coding needed.
              </p>
            </div>

            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{backgroundColor: '#00d4aa'}}>
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Automate and Grow</h3>
              <p style={{color: '#e5e5e5'}}>
                Let AI handle repetitive questions and boost your engagement 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#1a1a1a'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{color: '#00d4aa'}}>
              Choose Your Plan
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{color: '#e5e5e5'}}>
              Transform your customer service with AI automation that works 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={plan.id} className="rounded-xl p-8 relative" style={{backgroundColor: '#0a0a0a', border: plan.popular ? '1px solid #00d4aa' : '1px solid #333333'}}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="text-white px-4 py-1 rounded-full text-sm font-medium" style={{backgroundColor: '#00d4aa'}}>
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  {/* Plan Icons */}
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    {index === 0 && <div className="w-8 h-8 rounded-full" style={{backgroundColor: '#f59e0b'}}></div>}
                    {index === 1 && <div className="w-8 h-8 rounded text-center flex items-center justify-center" style={{backgroundColor: '#fbbf24'}}>⚡</div>}
                    {index === 2 && <div className="w-8 h-8 rounded text-center flex items-center justify-center" style={{backgroundColor: '#60a5fa'}}>💎</div>}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  
                  {/* Setup Fee */}
                  {index === 0 && <p className="text-sm mb-2" style={{color: '#e5e5e5'}}>One-time Setup: $50</p>}
                  {index === 1 && <p className="text-sm mb-2" style={{color: '#e5e5e5'}}>One-time Setup: $50</p>}
                  {index === 2 && <p className="text-sm mb-2" style={{color: '#e5e5e5'}}>Setup Included FREE</p>}
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span style={{color: '#e5e5e5'}}>/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start" style={{color: '#e5e5e5'}}>
                      <svg className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{color: '#00d4aa'}}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/start?plan=${plan.id}`} className="block w-full">
                  <button 
                    className="w-full py-3 rounded-lg font-semibold text-white transition-all"
                    style={{
                      backgroundColor: plan.popular ? '#00d4aa' : '#1a1a1a',
                      border: plan.popular ? 'none' : '1px solid #333333'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = plan.popular ? '#00b894' : '#2a2a2a'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = plan.popular ? '#00d4aa' : '#1a1a1a'
                    }}
                  >
                    CHOOSE {plan.name.toUpperCase()}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Businesses, Real Results Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{color: '#00d4aa'}}>
              Real Businesses, Real Results
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{backgroundColor: '#f97316'}}>
                <div className="w-8 h-8 rounded-full" style={{backgroundColor: '#fb923c'}}></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Save 60+ hours every month</h3>
              <p style={{color: '#e5e5e5'}}>
                Let AI handle repetitive DMs so you can focus on growing your business and building meaningful customer relationships.
              </p>
            </div>

            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{backgroundColor: '#00d4aa'}}>
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Respond instantly, 24/7</h3>
              <p style={{color: '#e5e5e5'}}>
                Never miss a message — customers get answers even at 2 AM. Your AI assistant never sleeps, ensuring zero response delays.
              </p>
            </div>

            <div className="rounded-xl p-8 text-center" style={{backgroundColor: '#1a1a1a'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{backgroundColor: '#ec4899'}}>
                <div className="w-8 h-8 rounded" style={{backgroundColor: '#f472b6'}}></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Cut down support load by 80%</h3>
              <p style={{color: '#e5e5e5'}}>
                Automate replies to your most common questions and FAQs, dramatically reducing manual customer service workload.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t" style={{backgroundColor: '#0a0a0a', borderColor: '#333333'}}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4" style={{color: '#00d4aa'}}>AIChatFlows</h3>
          <p className="mb-4" style={{color: '#e5e5e5'}}>
            Revolutionizing customer interaction with advanced AI automation.
          </p>
          <div className="text-center">
            <h4 className="font-semibold mb-2" style={{color: '#00d4aa'}}>Contact Us</h4>
            <a href="mailto:elisecore23@gmail.com" className="hover:text-white transition-colors" style={{color: '#e5e5e5'}}>
              Email: elisecore23@gmail.com
            </a>
          </div>
          <div className="mt-8 pt-8 border-t" style={{borderColor: '#333333'}}>
            <p className="text-sm" style={{color: '#999999'}}>
              © 2024 AIChatFlows. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link href="/legal" className="hover:text-gray-400 text-sm transition-colors" style={{color: '#999999'}}>
                Privacy Policy
              </Link>
              <span style={{color: '#999999'}}>•</span>
              <Link href="/legal" className="hover:text-gray-400 text-sm transition-colors" style={{color: '#999999'}}>
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