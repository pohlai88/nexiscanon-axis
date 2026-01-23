# Environment Variables Reference

> **Reference**: Complete list of environment variables.

## Required Variables

### Database (Neon PostgreSQL)

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` | Neon connection string with `-pooler` suffix |
| `BRANCH_ID` | `br-xxx-xxx` | Neon branch ID (for branching workflows) |

### Authentication (Neon Auth)

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_NEON_AUTH_URL` | `https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth` | Public Neon Auth endpoint |
| `JWKS_URL` | `https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth/.well-known/jwks.json` | JWT key set URL |

### Application

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://nexuscanon-axis.vercel.app` | Public application URL |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `nexuscanon-axis.vercel.app` | Root domain for multi-tenancy |

---

## Optional Variables

### Email (Resend)

| Variable | Example | Description |
|----------|---------|-------------|
| `RESEND_API_KEY` | `re_...` | Resend API key for transactional emails |

### Payments (Stripe)

| Variable | Example | Description |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |

### Storage (Cloudflare R2)

| Variable | Example | Description |
|----------|---------|-------------|
| `R2_ACCOUNT_ID` | `abc123...` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | `abc123...` | R2 access key ID |
| `R2_SECRET_ACCESS_KEY` | `abc123...` | R2 secret access key |
| `R2_BUCKET_NAME` | `axis-attachments` | R2 bucket name |
| `R2_ENDPOINT` | `https://xxx.r2.cloudflarestorage.com` | R2 endpoint URL |

### Observability

| Variable | Example | Description |
|----------|---------|-------------|
| `SENTRY_DSN` | `https://...@app.glitchtip.com/...` | Sentry/GlitchTip DSN for error tracking |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `https://otlp-gateway...` | OpenTelemetry endpoint |
| `OTEL_SERVICE_NAME` | `nexuscanon-axis-web` | Service name for tracing |

### Feature Flags

| Variable | Example | Description |
|----------|---------|-------------|
| `SUBDOMAIN_ROUTING_ENABLED` | `true` | Enable subdomain-based tenant routing |

---

## Development Only

| Variable | Example | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Node environment |
| `LOG_LEVEL` | `debug` | Logging verbosity |

---

## Vercel-Specific

When deploying to Vercel, these are set automatically:

| Variable | Description |
|----------|-------------|
| `VERCEL` | Set to `1` on Vercel |
| `VERCEL_ENV` | `production`, `preview`, or `development` |
| `VERCEL_URL` | Deployment URL |

---

## Environment File

Create `.env.local` from the sample:

```bash
cp .envsamplelocal .env.local
```

Never commit `.env.local` to git. It's already in `.gitignore`.

---

## Validation

The app validates required variables at startup. Missing variables will cause a clear error message.

To test your configuration:

```bash
pnpm dev --filter @axis/web
```

Check the console for any missing variable warnings.
