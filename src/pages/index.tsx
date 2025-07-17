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
      {/* Hero Section - Enhanced */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{backgroundColor: '#0a0a0a'}}>
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10F2B0] via-transparent to-[#00D0FF] animate-gradient-shift"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
              <span className="gradient-text animate-float">AI</span>ChatFlows
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl mb-16 max-w-3xl mx-auto font-light text-secondary leading-relaxed">
              Advanced AI Chatbots • Customer Service Automation
            </p>
            <Link href="/#pricing">
              <button className="bg-gradient-to-r from-[#10F2B0] to-[#00BDFD] text-white px-6 py-3 rounded-full hover:brightness-110 transition text-lg font-bold">
                SEE PLANS
              </button>
            </Link>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#10F2B0] rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[#00D0FF] rounded-full animate-float opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-[#10F2B0] rounded-full animate-float opacity-80" style={{animationDelay: '4s'}}></div>
      </section>

      {/* What We Offer Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              What We Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="feature-card text-center animate-slide-up stagger-1">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#10F2B0] to-[#00D0FF] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">24/7 AI Chatbot</h3>
              <p className="text-secondary text-lg leading-relaxed">
                Instant answers to customer questions across Instagram, Facebook, SMS & more.
              </p>
            </div>

            <div className="feature-card text-center animate-slide-up stagger-2">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00D0FF] to-[#10F2B0] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Seamless Setup</h3>
              <p className="text-secondary text-lg leading-relaxed">
                No coding needed—deploy your branded bot in minutes and start automating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 accent-blue">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="feature-card text-center animate-slide-up stagger-1">
              <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center relative animate-glow-pulse" style={{background: 'linear-gradient(135deg, #10F2B0, #00D0FF)'}}>
                <span className="text-white text-3xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Connect Your Channels</h3>
              <p className="text-secondary text-lg leading-relaxed">
                Securely link your Instagram, WhatsApp, TikTok, or Facebook accounts.
              </p>
            </div>

            <div className="feature-card text-center animate-slide-up stagger-2">
              <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center relative animate-glow-pulse" style={{background: 'linear-gradient(135deg, #10F2B0, #00D0FF)', animationDelay: '0.5s'}}>
                <span className="text-white text-3xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Customize Your AI</h3>
              <p className="text-secondary text-lg leading-relaxed">
                Set your brand voice, FAQs, and product info—no coding needed.
              </p>
            </div>

            <div className="feature-card text-center animate-slide-up stagger-3">
              <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center relative animate-glow-pulse" style={{background: 'linear-gradient(135deg, #10F2B0, #00D0FF)', animationDelay: '1s'}}>
                <span className="text-white text-3xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Automate and Grow</h3>
              <p className="text-secondary text-lg leading-relaxed">
                Let AI handle repetitive questions and boost your engagement 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative" style={{backgroundColor: '#1a1a1a'}}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, #10F2B0 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              Choose Your Plan
            </h2>
            <p className="text-xl lg:text-2xl max-w-3xl mx-auto text-secondary leading-relaxed">
              Transform your customer service with AI automation that works 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto pt-12 overflow-visible">
            {pricingPlans.map((plan, index) => (
              <div 
                key={plan.id} 
                className={`pricing-card ${plan.popular ? 'popular' : ''} animate-slide-up stagger-${index + 1} relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-[#10F2B0] to-[#00D0FF] text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-10">
                  {/* Enhanced Plan Icons */}
                  <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#10F2B0] to-[#00D0FF] shadow-lg">
                    {index === 0 && <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">🚀</div>}
                    {index === 1 && <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">⚡</div>}
                    {index === 2 && <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">💎</div>}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4">{plan.name}</h3>
                  
                  {/* Setup Fee */}
                  {index === 0 && <p className="text-sm mb-4 text-secondary">One-time Setup: $50</p>}
                  {index === 1 && <p className="text-sm mb-4 text-secondary">One-time Setup: $50</p>}
                  {index === 2 && <p className="text-sm mb-4 accent-green font-semibold">Setup Included FREE</p>}
                  
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-secondary text-lg">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-secondary">
                      <svg className="h-5 w-5 mt-1 mr-4 flex-shrink-0 accent-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/start?plan=${plan.id}`} className="block w-full">
                  <button 
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-white transition-all hover-lift ${
                      plan.popular 
                        ? 'btn-primary' 
                        : 'btn-secondary'
                    }`}
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
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              Real Businesses, Real Results
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="glass-card p-8 text-center animate-slide-up stagger-1">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Save 60+ hours every month</h3>
              <p className="text-secondary text-lg leading-relaxed">
                Let AI handle repetitive DMs so you can focus on growing your business and building meaningful customer relationships.
              </p>
            </div>

            <div className="glass-card p-8 text-center animate-slide-up stagger-2">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-[#10F2B0] to-[#00D0FF] shadow-lg animate-glow-pulse">
                <span className="text-white text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Respond instantly, 24/7</h3>
              <p className="text-secondary text-lg leading-relaxed">
                Never miss a message — customers get answers even at 2 AM. Your AI assistant never sleeps, ensuring zero response delays.
              </p>
            </div>

            <div className="glass-card p-8 text-center animate-slide-up stagger-3">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Cut down support load by 80%</h3>
              <p className="text-secondary text-lg leading-relaxed">
                Automate replies to your most common questions and FAQs, dramatically reducing manual customer service workload.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t" style={{backgroundColor: '#0a0a0a', borderColor: '#333333'}}>
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6 gradient-text animate-float">AIChatFlows</h3>
          <p className="mb-8 text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
            Revolutionizing customer interaction with advanced AI automation.
          </p>
          <div className="text-center mb-12">
            <h4 className="font-semibold mb-4 accent-green text-xl">Contact Us</h4>
            <a 
              href="mailto:eliascolon23@gmail.com" 
              className="text-secondary hover:text-white transition-colors text-lg hover-lift inline-block px-6 py-3 rounded-lg border border-white/10 hover:border-[#10F2B0]/30"
            >
              Email: eliascolon23@gmail.com
            </a>
          </div>
          <div className="pt-8 border-t" style={{borderColor: '#333333'}}>
            <p className="text-muted text-sm mb-4">
              © 2024 AIChatFlows. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/legal" className="text-muted hover:accent-green text-sm transition-colors hover-lift">
                Privacy Policy
              </Link>
              <span className="text-muted">•</span>
              <Link href="/legal" className="text-muted hover:accent-green text-sm transition-colors hover-lift">
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