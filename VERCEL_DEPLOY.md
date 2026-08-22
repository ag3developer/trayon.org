# Trayon.org Vercel Deployment Guide

## Setup Instructions

This is a monorepo structure with the Next.js application in the `web/` folder.

### In Vercel Dashboard:

1. Go to your project settings
2. Click **Settings** → **General**
3. Set **Root Directory** to: `web`
4. Save changes
5. Click **Redeploy** or push new code

### What's happening:

- **Repository Root**: `/Users/josecarlosmartins/Documents/trayon.org/` (contains documentation, specs, etc.)
- **Next.js App**: `/Users/josecarlosmartins/Documents/trayon.org/web/` (the actual application)
- **Vercel**: Auto-detects Next.js when Root Directory is set to `web`

## Build Information

- **Framework**: Next.js 16.3.2 with Turbopack
- **Build Output**: `.next/` folder
- **Languages**: 7 (EN, PT, ES, FR, DE, ZH, JA)
- **Features**:
  - Light/Dark theme system with localStorage
  - Golden network animation background
  - Official Trayon logo integration
  - Multi-language i18n with next-intl

## Environment Variables

None required for basic deployment. All theme preferences are stored in localStorage on the client.

## Troubleshooting

If you see 404 errors:
1. Verify **Root Directory** is set to `web` in Vercel Settings
2. Click **Redeploy** to trigger a fresh build
3. Check that `web/package.json` exists and has valid `next` command

If the site builds but doesn't load:
1. Check browser console for errors
2. Verify that the redirect from `/` to `/en` is working
3. Try accessing directly: `https://trayonorg.vercel.app/en`
