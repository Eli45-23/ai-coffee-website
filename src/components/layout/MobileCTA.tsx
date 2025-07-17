import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-all duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div 
        className="p-6 shadow-2xl border-t backdrop-blur-lg"
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 242, 176, 0.1)'
        }}
      >
        <Link href="/start" className="btn-primary w-full block text-center hover-lift animate-glow-pulse">
          Get Started Today
        </Link>
      </div>
    </div>
  )
}