# Tennessee Justice Bus - Deployment Guide

This document outlines the process for deploying the Tennessee Justice Bus Pre-Visit Client Screening application to Vercel.

## Prerequisites

- A Vercel account
- GitHub repository access
- Access to environment variable values for production

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository: `https://github.com/medelman17/tn-justice-bus`
4. Vercel will automatically detect that this is a Next.js project

### 2. Configure Environment Variables

Add the following environment variables to your Vercel project settings. For production deployment, these should contain real values:

```bash
# NextAuth.js v5 Configuration
AUTH_URL=https://your-production-url.vercel.app
AUTH_SECRET=your-secure-random-string

# Legacy NextAuth.js variables (can be removed after migration is complete)
# NEXTAUTH_URL=https://your-production-url.vercel.app
# NEXTAUTH_SECRET=your-secure-random-string

# Vercel Database URLs (These will be automatically configured if using Vercel Postgres/KV/Blob)
DATABASE_URL=postgres://username:password@host:port/database-name
KV_URL=redis://username:password@host:port
BLOB_READ_WRITE_TOKEN=your-vercel-blob-read-write-token

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Authentication Providers
EMAIL_SERVER=smtp://username:password@host:port
EMAIL_FROM=noreply@tnjusticebus.org

# SMS Provider (Knock)
KNOCK_API_KEY=your-knock-api-key
KNOCK_SIGNING_KEY=your-knock-signing-key

# Email Provider (Resend)
RESEND_API_KEY=your-resend-api-key

# AI Provider (Anthropic Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Scheduling Provider (Cal.com)
CALCOM_API_KEY=your-calcom-api-key

# Error Tracking & Monitoring
SENTRY_DSN=your-sentry-dsn

# Analytics
VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

#### Setting Environment Variables via Vercel CLI

You can also set environment variables using the Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Log in to Vercel
vercel login

# Add environment variables
vercel env add AUTH_SECRET
vercel env add AUTH_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add EMAIL_SERVER
# ... and so on for other variables
```

### 3. Configure Build Settings

The project comes with a `vercel.json` configuration that sets up:

- Build command: `pnpm build`
- Development command: `pnpm dev`
- Install command: `pnpm install`
- Output directory: `.next`
- Regions: `iad1` (US East - Virginia)

This configuration should be automatically applied when deploying to Vercel.

### 4. Set Up Vercel PostgreSQL Database

1. From your Vercel project dashboard, go to "Storage" tab
2. Click "Create Database" and select "PostgreSQL"
3. Follow the setup wizard to create your database
4. Vercel will automatically add the `DATABASE_URL` environment variable to your project

### 5. Set Up Vercel KV (Redis)

1. From your Vercel project dashboard, go to "Storage" tab
2. Click "Create Database" and select "KV Database"
3. Follow the setup wizard to create your KV database
4. Vercel will automatically add the `KV_URL` environment variable to your project

### 6. Set Up Vercel Blob Storage

1. From your Vercel project dashboard, go to "Storage" tab
2. Click "Create Storage" and select "Blob Storage"
3. Follow the setup wizard to create your Blob storage
4. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project

### 7. Deploy

1. Click "Deploy" button
2. Vercel will build and deploy your project
3. Once complete, you'll be provided with a URL for your deployed application

### 8. Configure Custom Domain (Optional)

1. From your Vercel project dashboard, go to "Domains" tab
2. Add your custom domain (e.g., `tnjusticebus.org`)
3. Follow the instructions to configure DNS settings

## Continuous Deployment

With Vercel's GitHub integration, any new commits to the main branch will automatically trigger a new deployment. You can also configure preview deployments for pull requests.

## NextAuth.js v5 Migration

The application has been migrated to NextAuth.js v5, which introduces several changes to the authentication system. Below are the key aspects to be aware of during deployment:

### Environment Variables

- NextAuth.js v5 uses `AUTH_` prefixed environment variables instead of `NEXTAUTH_`
- During the transition period, both sets of variables are supported
- Once migration is complete, the legacy `NEXTAUTH_` variables can be removed

### Edge Compatibility

- The authentication system now uses a split configuration approach:
  - `auth.config.ts` contains edge-compatible code used in middleware
  - `auth.ts` includes the full configuration with database adapter

### Cookie Format

- Cookie names have changed from `next-auth` prefix to `authjs` prefix
- The middleware is configured to support both formats during transition

### Testing After Deployment

After deploying, test the following authentication flows:

1. Email sign-in with magic links
2. Phone number sign-in with verification codes
3. Session persistence and protected routes
4. Middleware redirection for unauthenticated users

### Rollback Plan

If issues arise with NextAuth.js v5, you can roll back by:

1. Restoring previous files from version control
   - `src/app/api/auth/auth.ts`
   - `src/app/api/auth/[...nextauth]/route.ts`
   - `src/middleware.ts`
2. Removing the new configuration files:
   - `auth.config.ts`
   - `auth.ts`
3. Ensuring the legacy environment variables are set

## Troubleshooting

If you encounter deployment issues, check:

1. Vercel deployment logs for error messages
2. Ensure all required environment variables are correctly set
3. Check that your database connection is properly configured
4. Verify that the build process completes successfully

For more help, refer to the [Vercel Documentation](https://vercel.com/docs).
