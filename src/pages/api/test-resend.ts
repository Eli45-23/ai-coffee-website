import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing Resend configuration...')
    
    // Log environment variables (masked)
    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.FROM_EMAIL || 'noreply@ai-chatflows.com'
    const adminEmail = process.env.ADMIN_EMAIL || 'eliascolon23@gmail.com'
    
    console.log('Environment check:', {
      apiKeyExists: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 8) + '...',
      fromEmail,
      adminEmail: adminEmail.substring(0, 3) + '***@' + adminEmail.split('@')[1]
    })
    
    // Initialize Resend
    const resend = new Resend(apiKey)
    
    // Try to get domains list
    console.log('Attempting to fetch domains from Resend...')
    const { data: domains, error: domainsError } = await resend.domains.list()
    
    if (domainsError) {
      console.error('Failed to fetch domains:', domainsError)
      return res.status(500).json({
        error: 'Failed to fetch domains',
        details: domainsError
      })
    }
    
    console.log('Domains fetched successfully:', domains?.data?.length || 0)
    
    // Check if our domain is verified
    const ourDomain = domains?.data?.find(d => d.name === 'ai-chatflows.com')
    
    // Try a test email with different from addresses
    const testResults = []
    
    // Test 1: Try with Resend's test domain
    try {
      console.log('Test 1: Sending with onboarding@resend.dev')
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: adminEmail,
        subject: 'Test Email - Resend Dev Domain',
        html: '<p>This is a test email from Resend dev domain</p>'
      })
      
      testResults.push({
        test: 'resend.dev domain',
        success: !error,
        emailId: data?.id,
        error: error
      })
    } catch (err) {
      testResults.push({
        test: 'resend.dev domain',
        success: false,
        error: err
      })
    }
    
    // Test 2: Try with our domain if it exists
    if (ourDomain) {
      try {
        console.log('Test 2: Sending with noreply@ai-chatflows.com')
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: 'Test Email - AIChatFlows Domain',
          html: '<p>This is a test email from ai-chatflows.com domain</p>'
        })
        
        testResults.push({
          test: 'ai-chatflows.com domain',
          success: !error,
          emailId: data?.id,
          error: error
        })
      } catch (err) {
        testResults.push({
          test: 'ai-chatflows.com domain',
          success: false,
          error: err
        })
      }
    }
    
    res.status(200).json({
      success: true,
      environment: {
        apiKeyPrefix: apiKey?.substring(0, 8) + '...',
        fromEmail,
        adminEmail
      },
      domains: {
        count: domains?.data?.length || 0,
        list: domains?.data?.map(d => ({
          name: d.name,
          status: d.status,
          verified: d.status === 'verified',
          created: d.created_at
        })) || []
      },
      ourDomain: ourDomain ? {
        name: ourDomain.name,
        status: ourDomain.status,
        verified: ourDomain.status === 'verified',
        created: ourDomain.created_at
      } : null,
      testResults
    })
    
  } catch (error) {
    console.error('Test failed:', error)
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}