import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { getStripeInstance } from '@/lib/stripe'
import { 
  updateFormSubmission, 
  getFormSubmissionByStripeSession, 
  updateEnhancedOnboardingSubmission, 
  getEnhancedOnboardingSubmissionByStripeSession 
} from '@/lib/supabase'
import { sendEmail, createPaymentConfirmationClientEmail, createPaymentConfirmationAdminEmail } from '@/lib/resend'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const buf = await buffer(req)
    const signature = req.headers['stripe-signature'] as string

    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' })
    }

    // Verify the webhook
    const stripe = getStripeInstance()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const event = stripe.webhooks.constructEvent(buf, signature, webhookSecret)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object
          const submissionId = session.client_reference_id

          if (submissionId) {
            let submission: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
            let isEnhancedOnboarding = false

            // Try to update enhanced onboarding submission first
            try {
              await updateEnhancedOnboardingSubmission(submissionId, {
                payment_status: 'completed',
                stripe_session_id: session.id,
              })
              
              // If successful, get the updated submission
              submission = await getEnhancedOnboardingSubmissionByStripeSession(session.id)
              isEnhancedOnboarding = true
              console.log(`Enhanced onboarding payment completed for submission ${submissionId}`)
            } catch {
              // If not found in enhanced onboarding, try legacy form submissions
              try {
                await updateFormSubmission(submissionId, {
                  payment_status: 'completed',
                  stripe_session_id: session.id,
                })
                
                // If successful, get the updated submission
                submission = await getFormSubmissionByStripeSession(session.id)
                console.log(`Legacy form payment completed for submission ${submissionId}`)
              } catch (legacyError) {
                console.error('Failed to find submission in either enhanced or legacy tables:', legacyError)
                return res.status(400).json({ error: 'Submission not found' })
              }
            }

            if (!submission) {
              console.error(`No submission found for session ${session.id}`)
              return res.status(400).json({ error: 'Submission not found' })
            }

            // Send payment confirmation email to customer
            try {
              const stripeSessionData = {
                id: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                customer: session.customer,
                payment_intent: session.payment_intent,
                payment_status: session.payment_status
              }
              const confirmationEmail = createPaymentConfirmationClientEmail(submission, stripeSessionData)
              await sendEmail(confirmationEmail, { preventDuplicates: true, emailType: 'payment_confirmation' })
              console.log(`Payment confirmation email sent to ${submission.email}`)
            } catch (emailError) {
              console.error('Failed to send payment confirmation email:', emailError)
            }

            // Send payment notification to admin
            try {
              const stripeSessionData = {
                id: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                customer: session.customer,
                payment_intent: session.payment_intent,
                payment_status: session.payment_status,
                created: session.created,
                metadata: session.metadata
              }
              const adminEmail = createPaymentConfirmationAdminEmail(submission, stripeSessionData)
              await sendEmail(adminEmail, { preventDuplicates: true, emailType: 'payment_confirmation' })
              
              const businessName = isEnhancedOnboarding ? submission.business_name : submission.name
              console.log(`Payment admin notification sent for ${businessName}`)
            } catch (emailError) {
              console.error('Failed to send admin payment notification:', emailError)
            }
          }
        }
        break

      case 'checkout.session.expired':
        {
          const session = event.data.object
          const submissionId = session.client_reference_id

          if (submissionId) {
            console.log(`Payment session expired for submission ${submissionId}`)
            // Optionally handle expired sessions
          }
        }
        break

      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object
          console.log(`Payment failed for payment intent ${paymentIntent.id}`)
          // Optionally handle failed payments
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).json({ 
      error: 'Webhook error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}