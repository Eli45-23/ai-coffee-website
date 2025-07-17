import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <nav 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isScrolled 
          ? 'rgba(10, 10, 10, 0.95)' 
          : 'rgba(10, 10, 10, 0.7)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(10px)',
        boxShadow: isScrolled 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 242, 176, 0.1)' 
          : 'none',
        borderBottom: isScrolled 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 hover-lift">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg animate-float"
              style={{background: 'linear-gradient(135deg, #10F2B0, #00D0FF)'}}
            >
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">AIChatFlows</span>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link 
              href="/#pricing" 
              className="text-secondary hover:text-white transition-all duration-300 font-medium hover-lift text-lg"
            >
              Pricing
            </Link>
            <Link href="/start" className="btn-primary hover-lift">
              Get Started
            </Link>
          </div>

          <div className="md:hidden">
            <Link href="/start" className="btn-primary text-sm px-4 py-2 hover-lift">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}