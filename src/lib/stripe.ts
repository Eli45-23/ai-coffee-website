import Stripe from 'stripe'

// Only create stripe instance on server side
export const getStripeInstance = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Stripe secret key should not be used on client side')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  })
}

export const STRIPE_PRICING_LINKS = {
  starter: 'https://buy.stripe.com/fZu5kEaZ4dQqbKUfNZ8Vi00',
  pro: 'https://buy.stripe.com/3cI5kE7MS13EcOY6dp8Vi01',
  pro_plus: 'https://buy.stripe.com/28EeVe9V06nY4is59l8Vi02',
} as const

export const STRIPE_PRICES = {
  starter: { amount: 2997, currency: 'usd', name: 'Starter Plan' },
  pro: { amount: 4997, currency: 'usd', name: 'Pro Plan' },
  pro_plus: { amount: 9997, currency: 'usd', name: 'Pro Plus Plan' },
} as const

export type PricingTier = keyof typeof STRIPE_PRICING_LINKS

export function getStripeCheckoutUrl(plan: PricingTier, submissionId?: string) {
  const baseUrl = STRIPE_PRICING_LINKS[plan]
  if (submissionId) {
    return `${baseUrl}?client_reference_id=${submissionId}`
  }
  return baseUrl
}

export function formatPrice(amount: number, currency: string = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

