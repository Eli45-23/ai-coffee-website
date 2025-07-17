# AIChatFlows - AI-Powered Social Media Management

A modern, secure SaaS website for AIChatFlows with complete onboarding, payment processing, and email automation. Built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe, and Resend.

## 🚀 Features

- **Modern SaaS Design**: Clean, white-themed, premium interface
- **Secure Onboarding Form**: Dynamic form fields based on pricing tiers
- **Stripe Integration**: Secure payment processing with webhooks
- **Email Automation**: Welcome emails, payment confirmations, and admin notifications
- **Supabase Database**: Secure data storage with Row Level Security (RLS)
- **File Upload**: Support for screenshots and documents
- **Mobile Optimized**: Responsive design with mobile-specific CTAs
- **SEO Ready**: Meta tags, sitemap, and optimized performance

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.0.0 or higher
- npm or yarn package manager
- A Supabase account and project
- A Stripe account (live keys for production)
- A Resend account for email delivery

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eli45-23/ai-coffee-website.git
   cd ai-coffee-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

## ⚙️ Environment Configuration

Configure your `.env.local` file with the following variables:

### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Stripe Configuration
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Resend Configuration
```env
RESEND_API_KEY=your_resend_api_key
```

### Application URLs
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com
FROM_EMAIL=noreply@your-domain.com
```

## 🗄️ Database Setup

### Supabase Table Structure

Create the following table in your Supabase project:

```sql
CREATE TABLE form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    company VARCHAR,
    plan VARCHAR NOT NULL CHECK (plan IN ('starter', 'pro', 'pro_plus')),
    instagram_login VARCHAR,
    facebook_login VARCHAR,
    twitter_login VARCHAR,
    linkedin_login VARCHAR,
    tiktok_login VARCHAR,
    login_sharing_preference VARCHAR NOT NULL CHECK (login_sharing_preference IN ('secure_site', 'in_person_setup', 'email_encrypted', 'phone_call')),
    file_url VARCHAR,
    source VARCHAR DEFAULT 'ai-chatflows.com',
    payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed')),
    stripe_session_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Row Level Security (RLS) Policies

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their own submissions
CREATE POLICY "Enable insert for anonymous users" ON form_submissions FOR INSERT WITH CHECK (true);

-- Allow anonymous users to select their own submissions
CREATE POLICY "Enable select for anonymous users" ON form_submissions FOR SELECT USING (true);

-- Allow service role to update submissions (for webhook)
CREATE POLICY "Enable update for service role" ON form_submissions FOR UPDATE USING (auth.role() = 'service_role');
```

## 💳 Stripe Setup

### 1. Create Products and Prices

Create the following products in your Stripe dashboard:

- **Starter Plan**: $29.97/month
- **Pro Plan**: $49.97/month  
- **Pro Plus Plan**: $99.97/month

### 2. Update Pricing URLs

Update the URLs in `src/lib/stripe.ts`:

```typescript
export const STRIPE_PRICING_LINKS = {
  starter: 'https://buy.stripe.com/fZu5kEaZ4dQqbKUfNZ8Vi00',
  pro: 'https://buy.stripe.com/3cI5kE7MS13EcOY6dp8Vi01',
  pro_plus: 'https://buy.stripe.com/28EeVe9V06nY4is59l8Vi02',
}
```

### 3. Configure Webhooks

Set up a webhook endpoint in Stripe pointing to:
```
https://your-domain.com/api/stripe/webhook
```

Listen for these events:
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.payment_failed`

## 📧 Email Setup with Resend

### 1. Create Resend Account

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add your API key to `.env.local`

### 2. Domain Authentication (Recommended)

For production, set up domain authentication:

1. **Add your domain** in the Resend dashboard
2. **Add DNS records** to your domain:
   ```
   TXT record: _resend.your-domain.com
   Value: [provided by Resend]
   ```
3. **Update FROM_EMAIL** in `.env.local`:
   ```env
   FROM_EMAIL=noreply@your-domain.com
   ```

### 3. Alternative: SendGrid Setup

If you prefer SendGrid, replace Resend with SendGrid:

1. Install SendGrid SDK:
   ```bash
   npm install @sendgrid/mail
   ```

2. Update email functions in `src/lib/resend.ts`
3. Configure SendGrid API key in environment variables

## 🚀 Deployment

### Deploy to Render

1. **Connect Repository**
   - Link your GitHub repository to Render
   - Select "Web Service" deployment

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Ensure `NEXT_PUBLIC_APP_URL` matches your domain

4. **Custom Domain** (Optional)
   - Add your custom domain in Render dashboard
   - Update DNS records as instructed

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard.

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🔧 Development

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Run Linting

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (Navbar, Footer)
│   └── ui/             # Reusable UI components
├── lib/
│   ├── supabase.ts     # Supabase client and functions
│   ├── stripe.ts       # Stripe integration
│   ├── resend.ts       # Email service
│   ├── validations.ts  # Zod validation schemas
│   └── utils.ts        # Utility functions
├── pages/
│   ├── api/            # API routes
│   ├── index.tsx       # Homepage
│   ├── onboarding.tsx  # Onboarding form
│   ├── success.tsx     # Payment success page
│   ├── thank-you.tsx   # Thank you page
│   ├── legal.tsx       # Privacy policy & terms
│   └── 404.tsx         # Custom 404 page
├── styles/
│   └── globals.css     # Global styles and Tailwind
└── types/
    └── index.ts        # TypeScript type definitions
```

## 🔒 Security Features

- **HTTPS Headers**: Security headers configured in `next.config.mjs`
- **Input Validation**: Zod schemas for all form inputs
- **RLS Policies**: Database-level security with Supabase
- **Webhook Verification**: Stripe webhook signature verification
- **File Upload Limits**: 10MB limit with type restrictions
- **Environment Variables**: Sensitive data properly secured

## 🧪 Testing

### Test Form Submission

1. Fill out the onboarding form
2. Check that data is saved in Supabase
3. Verify welcome email is sent
4. Complete Stripe payment
5. Confirm payment webhook updates database
6. Verify payment confirmation email

### Test Email Templates

Use Resend&apos;s testing features to preview email templates.

## 📊 Monitoring

### Supabase Dashboard

Monitor:
- Form submissions
- Database performance
- API usage

### Stripe Dashboard

Monitor:
- Payment success rates
- Webhook delivery
- Customer data

### Resend Dashboard

Monitor:
- Email delivery rates
- Bounce rates
- Open rates

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run lint`
   - Verify environment variables are set

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies are configured

3. **Payment Issues**
   - Verify Stripe webhook endpoint
   - Check webhook secret matches
   - Ensure live keys for production

4. **Email Issues**
   - Verify Resend API key
   - Check domain authentication
   - Test with Resend&apos;s testing tools

### Support

For issues or questions:
- Email: admin@ai-chatflows.com
- GitHub Issues: [Repository Issues](https://github.com/Eli45-23/ai-coffee-website/issues)

## 📄 License

This project is private and proprietary to AIChatFlows.

---

**Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.**
