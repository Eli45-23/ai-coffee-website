import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-sm shadow-sm' 
        : 'bg-gray-900/50'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="font-bold text-xl text-white">AIChatFlows</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/start" className="btn-primary">
              Get Started
            </Link>
          </div>

          <div className="md:hidden">
            <Link href="/start" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}