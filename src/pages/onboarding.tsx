import { GetServerSideProps } from 'next'
import Layout from '@/components/layout/Layout'
import OnboardingForm from '@/components/forms/OnboardingForm'
import { PricingTier } from '@/types'

interface OnboardingPageProps {
  initialPlan: PricingTier
}

export default function OnboardingPage({ initialPlan }: OnboardingPageProps) {
  return (
    <Layout 
      title="Get Started - AIChatFlows"
      description="Start your journey with AI-powered social media management. Complete our onboarding form to get started."
      showMobileCTA={false}
    >
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <OnboardingForm initialPlan={initialPlan} />
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