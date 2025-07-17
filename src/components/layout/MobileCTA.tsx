import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function MobileCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling down 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300',
      isVisible ? 'translate-y-0' : 'translate-y-full'
    )}>
      <div className="bg-gray-900 border-t border-gray-700 p-4 shadow-lg">
        <Link href="/start" className="btn-primary w-full block text-center">
          Get Started Today
        </Link>
      </div>
    </div>
  )
}