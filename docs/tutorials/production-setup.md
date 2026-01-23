# Production Setup Guide

> Manual configuration steps for external services after Vercel deployment.

**Prerequisites:**
- App deployed to Vercel: https://nexuscanon-axis.vercel.app
- Access to Resend, Stripe, and Cloudflare dashboards
- Environment variables already configured in Vercel

---

## 1. Resend Domain Verification

Enables sending emails from `@nexuscanon.com` instead of Resend's shared domain.

### Steps

1. **Go to Resend Dashboard**
   - https://resend.com/domains

2. **Add Domain**
   - Click "Add Domain"
   - Enter: `nexuscanon.com`

3. **Add DNS Records**
   
   Resend will provide DNS records. Add these to your domain registrar:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | TXT | `resend._domainkey` | `p=MII...` (provided by Resend) | 3600 |
   | TXT | `@` | `v=spf1 include:amazonses.com ~all` | 3600 |
   | CNAME | `em` | `u12345.wl.sendgrid.net` (example) | 3600 |

4. **Verify Domain**
   - Click "Verify" in Resend dashboard
   - Wait for DNS propagation (usually 5-30 minutes)

5. **Update FROM_EMAIL** (if needed)
   
   In `apps/web/src/lib/email/index.ts`:
   ```typescript
   const FROM_EMAIL = "AXIS <noreply@nexuscanon.com>";
   ```

### Verification

Send a test email:
```bash
curl -X POST https://nexuscanon-axis.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your@email.com"}'
```

---

## 2. Stripe Webhook Configuration

Enables real-time subscription updates, payment failure notifications, and billing sync.

### Steps

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks

2. **Create Endpoint**
   - Click "Add endpoint"
   - **Endpoint URL:** `https://nexuscanon-axis.vercel.app/api/webhooks/stripe`
   - **Description:** NexusCanon AXIS Production

3. **Select Events**
   
   Enable these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

4. **Get Webhook Secret**
   - After creating, click the endpoint
   - Under "Signing secret", click "Reveal"
   - Copy the `whsec_...` value

5. **Add to Vercel**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - Apply to: Production, Preview, Development

6. **Redeploy**
   ```bash
   npx vercel --prod
   ```

### Verification

Use Stripe CLI to test:
```bash
stripe listen --forward-to https://nexuscanon-axis.vercel.app/api/webhooks/stripe
stripe trigger checkout.session.completed
```

Or check Stripe Dashboard → Webhooks → Your endpoint → "Attempts" tab.

---

## 3. Cloudflare R2 CORS Configuration

Enables browser-based file uploads via presigned URLs.

### Steps

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Select your account → R2 → `axis-attachments` bucket

2. **Configure CORS**
   - Click "Settings" tab
   - Scroll to "CORS Policy"
   - Click "Edit CORS Policy"

3. **Add CORS Rules**

   ```json
   [
     {
       "AllowedOrigins": [
         "https://nexuscanon-axis.vercel.app",
         "http://localhost:3000"
       ],
       "AllowedMethods": [
         "GET",
         "PUT",
         "HEAD"
       ],
       "AllowedHeaders": [
         "Content-Type",
         "Content-Length",
         "x-amz-*"
       ],
       "ExposeHeaders": [
         "ETag"
       ],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

4. **Save**
   - Click "Save"

### Verification

Test file upload in the app:
1. Go to any tenant settings page
2. Try uploading a file (if upload UI exists)
3. Check browser console for CORS errors

Or test via curl:
```bash
# Get presigned URL
curl -X POST https://nexuscanon-axis.vercel.app/api/upload \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"tenantSlug": "your-tenant", "filename": "test.txt", "contentType": "text/plain"}'
```

---

## 4. Custom Domain (Optional)

### Steps

1. **Go to Vercel Dashboard**
   - Project → Settings → Domains

2. **Add Domain**
   - Enter your domain (e.g., `app.nexuscanon.com`)
   - Click "Add"

3. **Configure DNS**
   
   Add these records at your registrar:

   | Type | Name | Value |
   |------|------|-------|
   | CNAME | `app` | `cname.vercel-dns.com` |
   
   Or for apex domain:
   | Type | Name | Value |
   |------|------|-------|
   | A | `@` | `76.76.21.21` |

4. **SSL Certificate**
   - Vercel automatically provisions SSL
   - Wait for "Valid Configuration" status

5. **Update Environment Variables**
   
   In Vercel, update:
   - `NEXT_PUBLIC_APP_URL` = `https://app.nexuscanon.com`
   - `NEXT_PUBLIC_ROOT_DOMAIN` = `nexuscanon.com`

6. **Redeploy**
   ```bash
   npx vercel --prod
   ```

---

## 5. Vercel Firewall (Bad Bot Protection)

### Steps

1. **Go to Vercel Dashboard**
   - Project → Settings → Firewall

2. **Add Rule**
   - Click "Add Rule"
   - Import from `apps/web/firewall/bad-bot-rule.json`

3. **Configure**
   
   ```json
   {
     "name": "Block Bad Bots",
     "action": "log",
     "conditions": {
       "userAgent": {
         "contains": [
           "AhrefsBot", "SemrushBot", "DotBot", "MJ12bot",
           "BLEXBot", "DataForSeoBot", "Bytespider",
           "sqlmap", "nikto", "Nmap"
         ]
       }
     }
   }
   ```

4. **Test Phase**
   - Start with `action: "log"` for 1-2 weeks
   - Monitor in Vercel → Analytics → Firewall

5. **Enable Blocking**
   - After testing, change to `action: "deny"`

---

## Checklist

After completing all steps:

- [ ] Resend: Domain verified, test email sent
- [ ] Stripe: Webhook endpoint active, events flowing
- [ ] R2: CORS configured, uploads working
- [ ] Custom domain: (Optional) DNS propagated, SSL valid
- [ ] Firewall: Bad bot rule in "log" mode

---

## Troubleshooting

### Resend: "Domain not verified"
- DNS propagation can take up to 48 hours
- Use https://dnschecker.org to verify records
- Ensure no conflicting SPF records

### Stripe: "Signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Check for extra whitespace in the value
- Redeploy after adding the variable

### R2: "CORS error in browser"
- Verify `AllowedOrigins` includes your exact domain
- Include both `https://` and no trailing slash
- Check for typos in bucket name

### Custom Domain: "DNS not configured"
- CNAME records require 24-48 hours to propagate
- Use https://dnschecker.org to check propagation
- Ensure no conflicting A records

---

## Related Documentation

- [Resend Docs: Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [Stripe Docs: Webhooks](https://stripe.com/docs/webhooks)
- [Cloudflare R2: CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [Vercel Docs: Custom Domains](https://vercel.com/docs/projects/domains)
- [Vercel Docs: Firewall](https://vercel.com/docs/security/vercel-firewall)
