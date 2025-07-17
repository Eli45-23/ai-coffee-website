import { GetServerSideProps } from 'next'
import Layout from '@/components/layout/Layout'
import EnhancedOnboardingForm from '@/components/forms/EnhancedOnboardingForm'
import { PricingTier } from '@/types'

interface StartPageProps {
  initialPlan: PricingTier
}

export default function StartPage({ initialPlan }: StartPageProps) {
  return (
    <Layout 
      title="Get Started - AIChatFlows"
      description="Start your AI chatbot setup with AIChatFlows. Complete our comprehensive onboarding to create your perfect automated customer service solution."
      showMobileCTA={false}
      showFooter={false}
    >
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0a0a0a'}}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, #10F2B0 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          <EnhancedOnboardingForm initialPlan={initialPlan} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#10F2B0] rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[#00D0FF] rounded-full animate-float opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-[#10F2B0] rounded-full animate-float opacity-80" style={{animationDelay: '4s'}}></div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const plan = query.plan as string
  const validPlans: PricingTier[] = ['starter', 'pro', 'pro_plus']
  
  const initialPlan: PricingTier = validPlans.includes(plan as PricingTier) 
    ? (plan as PricingTier) 
    : 'starter'

  return {
    props: {
      initialPlan,
    },
  }
}