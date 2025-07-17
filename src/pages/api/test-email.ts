import { NextApiRequest, NextApiResponse } from 'next'
import { sendEmail, EmailTemplate } from '@/lib/resend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, subject, testMessage } = req.body

    if (!to || !subject) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject' 
      })
    }

    // Create a simple test email template
    const testEmail: EmailTemplate = {
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10F2B0 0%, #00D0FF 100%); padding: 30px; text-align: center; color: white; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 24px;">🧪 Test Email</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">AIChatFlows Email System Test</p>
          </div>
          
          <div style="padding: 30px 0;">
            <p style="font-size: 16px; color: #374151;">
              This is a test email to verify the Resend integration is working correctly.
            </p>
            
            ${testMessage ? `
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af;">Test Message:</h3>
                <p style="margin: 0; color: #374151;">${testMessage}</p>
              </div>
            ` : ''}
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #059669;">✅ Email System Status:</h3>
              <p style="margin: 0; color: #374151;">
                If you're receiving this email, the Resend integration is working correctly!
              </p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">📊 Test Details:</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
                <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>API Key Status:</strong> ${process.env.RESEND_API_KEY ? 'Present' : 'Missing'}<br>
                <strong>From Email:</strong> ${process.env.FROM_EMAIL || 'noreply@ai-chatflows.com'}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 14px;">
              © 2024 AIChatFlows - Email System Test
            </p>
          </div>
        </body>
        </html>
      `
    }

    console.log('Sending test email to:', to)
    
    const result = await sendEmail(testEmail, { 
      preventDuplicates: false, 
      emailType: 'form_submission' 
    })

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      emailId: result && 'id' in result ? result.id : null,
      to: to,
      subject: subject
    })

  } catch (error) {
    console.error('Test email failed:', error)
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test email failed to send'
    })
  }
}