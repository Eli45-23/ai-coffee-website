import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { getStripeInstance } from '@/lib/stripe'
import { updateFormSubmission, getFormSubmissionByStripeSession } from '@/lib/supabase'
import { sendEmail, createPaymentConfirmationEmail, createAdminNotificationEmail } from '@/lib/resend'

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
            // Update the submission status
            await updateFormSubmission(submissionId, {
              payment_status: 'completed',
              stripe_session_id: session.id,
            })

            // Get the updated submission for emails
            const submission = await getFormSubmissionByStripeSession(session.id)

            // Send payment confirmation email to customer
            try {
              const confirmationEmail = createPaymentConfirmationEmail(submission)
              await sendEmail(confirmationEmail)
            } catch (emailError) {
              console.error('Failed to send payment confirmation email:', emailError)
            }

            // Send updated admin notification
            try {
              const adminEmail = createAdminNotificationEmail({
                ...submission,
                payment_status: 'completed',
              })
              await sendEmail(adminEmail)
            } catch (emailError) {
              console.error('Failed to send admin payment notification:', emailError)
            }

            console.log(`Payment completed for submission ${submissionId}`)
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