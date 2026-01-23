# Deploy to Vercel

> **Tutorial**: This guide will walk you through deploying NexusCanon-AXIS to Vercel.

## What You'll Learn

By the end of this tutorial, you will have:
- Connected your repository to Vercel
- Configured the monorepo settings
- Set up environment variables
- Deployed your application to production

## Prerequisites

- A Vercel account (free tier works)
- Your repository pushed to GitHub
- Environment variables from your `.env.local`

---

## Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your NexusCanon-AXIS repository
4. Click **Import**

## Step 2: Configure Monorepo Settings

Vercel needs to know this is a monorepo. Configure these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && pnpm turbo build --filter=@axis/web` |
| **Install Command** | `cd ../.. && pnpm install` |
| **Output Directory** | `.next` |

> **Important**: The build command navigates to the monorepo root to run Turborepo.

## Step 3: Set Environment Variables

Add these required variables in Vercel → Settings → Environment Variables:

### Database (Neon)

```
DATABASE_URL=postgresql://...@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

### Authentication (Neon Auth)

```
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth
JWKS_URL=https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth/.well-known/jwks.json
```

### Email (Resend)

```
RESEND_API_KEY=re_...
```

### Payments (Stripe)

```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Configure after first deploy
```

### Storage (Cloudflare R2)

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=https://....r2.cloudflarestorage.com
```

### Application

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ROOT_DOMAIN=your-app.vercel.app
```

## Step 4: Deploy

Click **Deploy**. Vercel will:

1. Install dependencies
2. Run the Turborepo build
3. Deploy to the Edge Network

This takes ~2 minutes for the first build.

## Step 5: Verify Deployment

Once deployed, verify everything works:

1. Visit your deployment URL
2. Check the health endpoint: `https://your-app.vercel.app/api/health`
3. Try registering a new account
4. Create a workspace

---

## Post-Deployment: Stripe Webhooks

To receive Stripe events, configure a webhook:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret**
6. Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`
7. Redeploy

---

## Turborepo Remote Caching

Vercel automatically enables Turborepo remote caching. Subsequent builds will be faster (~30s vs ~2m).

To verify caching:
1. Go to Vercel → Deployments → Build Logs
2. Look for "Remote caching enabled" or cache hit messages

---

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel → Settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_ROOT_DOMAIN`

---

## Troubleshooting

### "Module not found" errors

- Ensure Root Directory is `apps/web`
- Ensure Build Command includes `cd ../..`

### "Database connection failed"

- Verify DATABASE_URL uses `-pooler` suffix
- Check environment variables are set for Production

### Build times are slow

- Verify Turborepo caching is enabled
- Check for cache misses in build logs

---

## Summary

You've successfully:
- ✅ Deployed to Vercel
- ✅ Configured monorepo build settings
- ✅ Set up environment variables
- ✅ Verified the deployment

Your app is now live on the Vercel Edge Network!

---

## What's Next?

- **[Configure Stripe Webhooks](../how-to/configure-stripe.md)** - Enable billing
- **[Set Up Custom Domain](../how-to/custom-domain.md)** - Use your own domain
- **[Enable Subdomain Routing](../how-to/setup-subdomain.md)** - `tenant.yourdomain.com`
