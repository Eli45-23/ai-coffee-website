import Link from 'next/link'
import { CheckIcon } from '@heroicons/react/24/solid'
import { PricingPlan } from '@/types'
import { formatPrice } from '@/lib/stripe'
import Button from './Button'

interface PricingCardProps {
  plan: PricingPlan
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <div className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(plan.price)}
          </span>
          <span className="text-gray-500">/month</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Link 
        href={`/start?plan=${plan.id}`}
        className="block w-full"
      >
        <Button 
          variant={plan.popular ? 'primary' : 'secondary'}
          className="w-full"
        >
          Get Started
        </Button>
      </Link>
    </div>
  )
}