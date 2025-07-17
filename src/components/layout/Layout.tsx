import { ReactNode } from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileCTA from './MobileCTA'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  showMobileCTA?: boolean
  showFooter?: boolean
}

export default function Layout({ 
  children, 
  title = 'AIChatFlows - AI-Powered Social Media Management',
  description = 'Automate your social media presence with AI-powered content creation and management. Get started today.',
  showMobileCTA = true,
  showFooter = true
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/og-image.jpg" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="AIChatFlows" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL} />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        {showFooter && <Footer />}
        {showMobileCTA && <MobileCTA />}
      </div>
    </>
  )
}