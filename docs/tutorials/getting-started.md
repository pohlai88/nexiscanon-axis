# Getting Started with NexusCanon-AXIS

> **Tutorial**: This guide will walk you through setting up your development environment and running the application locally.

## What You'll Learn

By the end of this tutorial, you will have:
- Cloned and installed the project
- Connected to a Neon database
- Run the application locally
- Logged in and created your first workspace

## Prerequisites

- Node.js 20+
- pnpm 9.15+
- A Neon account (free tier works)
- Git

---

## Step 1: Clone the Repository

First, we'll get the code onto your machine.

```bash
git clone https://github.com/nexuscanon/NexusCanon-AXIS.git
cd NexusCanon-AXIS
```

## Step 2: Install Dependencies

We use pnpm for package management. Let's install everything.

```bash
pnpm install
```

This will install dependencies for all packages in the monorepo.

## Step 3: Set Up Environment Variables

Copy the sample environment file:

```bash
cp .envsamplelocal .env.local
```

Now open `.env.local` and fill in your credentials:

```bash
# Required: Neon Database
DATABASE_URL=postgresql://...@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# Required: Neon Auth
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth
JWKS_URL=https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth/.well-known/jwks.json

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Tip**: Get your DATABASE_URL from the Neon Console → Connection Details. Make sure it includes `-pooler` in the hostname.

## Step 4: Initialize the Database

Run the schema against your Neon database. You can use the Neon SQL Editor:

1. Open your Neon project
2. Go to SQL Editor
3. Paste the contents of `apps/web/db/schema.sql`
4. Execute

Or seed demo data:

```bash
pnpm tsx scripts/seed.ts
```

## Step 5: Start the Development Server

Now let's run the application:

```bash
pnpm dev --filter @axis/web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Create Your First Account

1. Click **Register** on the home page
2. Enter your email and password
3. You'll be redirected to the **Onboarding** page
4. Enter your organization name
5. Click **Create Organization**

Congratulations! You now have a workspace at `http://localhost:3000/your-org-slug`.

---

## What's Next?

Now that you have the app running:

- **[Create a Team](./first-tenant.md)** - Add a team under your organization
- **[Deploy to Vercel](./deploy-to-vercel.md)** - Go to production
- **[Architecture Overview](../explanation/architecture.md)** - Understand how it works

---

## Troubleshooting

### "Database connection failed"

- Ensure your DATABASE_URL has the `-pooler` suffix
- Check that your Neon project is active (not suspended)
- Verify SSL mode is `require`

### "Auth callback error"

- Ensure `NEXT_PUBLIC_NEON_AUTH_URL` matches your Neon Auth endpoint
- Check that JWKS_URL is correctly set

### "pnpm: command not found"

Install pnpm globally:

```bash
npm install -g pnpm
```

---

## Summary

You've successfully:
- ✅ Cloned and installed the project
- ✅ Connected to Neon PostgreSQL
- ✅ Started the development server
- ✅ Created your first workspace

Welcome to NexusCanon-AXIS!
