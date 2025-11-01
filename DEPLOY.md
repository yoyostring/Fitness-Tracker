# Deployment Guide for Vercel

## Prerequisites

- A Vercel account ([vercel.com](https://vercel.com))
- Your Supabase project credentials

## Environment Variables

You need to add the following environment variables in Vercel:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anonymous/public key
3. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Your Google OAuth client ID (for Google Sign-In)

To find these in Supabase:

- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
- Copy the "anon public" key for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

To find your Google OAuth client ID:

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Select your project → APIs & Services → Credentials
- Copy your OAuth 2.0 Client ID

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Next.js
6. Add your environment variables:
   - Click "Environment Variables"
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
7. Click "Deploy"
8. Done! Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

1. Install Vercel CLI globally:

   ```bash
   npm i -g vercel
   ```

2. Navigate to your website directory:

   ```bash
   cd website
   ```

3. Run deployment:

   ```bash
   vercel
   ```

4. Follow the prompts to:

   - Link to an existing project or create a new one
   - Set up your environment variables when prompted

5. For production deployment:
   ```bash
   vercel --prod
   ```

### Method 3: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Choose "Deploy manually"
4. You can drag and drop your `website` folder or use the Vercel CLI

## Configuration

- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `next build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

## Post-Deployment

After deploying, make sure to:

1. **Configure Google OAuth Authorized Origins:**

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID
   - Under "Authorized JavaScript origins," click "Add URI"
   - Add your Vercel production URL: `https://your-project.vercel.app`
   - Add your local development URL: `http://localhost:3000`
   - Click "Save"

2. **Configure Supabase Redirect URLs:**

   - Go to your Supabase project dashboard
   - Navigate to Authentication → URL Configuration
   - Add your production URL to "Redirect URLs": `https://your-project.vercel.app`
   - Add your local development URL: `http://localhost:3000`

3. Test authentication flows (login, signup)
4. Verify database connections
5. Check that environment variables are properly loaded
6. Test the email confirmation flow
7. Update any hardcoded URLs in your code to use environment variables

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Verify environment variables are set correctly
- Check build logs in Vercel dashboard

### Authentication Issues

- Ensure Supabase environment variables are correct
- Verify Supabase project is active
- Check Supabase redirect URLs in project settings
- **If you see "origin_mismatch" error:**
  - Go to Google Cloud Console → Credentials → OAuth 2.0 Client ID
  - Add `https://your-project.vercel.app` to "Authorized JavaScript origins"
  - Add `https://your-project.vercel.app` to "Authorized redirect URIs"
  - Save and redeploy your Vercel app

### Missing Environment Variables

- Double-check variable names (case-sensitive)
- Ensure variables are set for production environment
- Redeploy after adding new variables

## Custom Domain

To add a custom domain:

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your domain
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs to include your custom domain
