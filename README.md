This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Railway (Manual)

### Prerequisites
- A [Railway](https://railway.app) account (Free tier works — no credit card required)
- Your repo pushed to GitHub: `https://github.com/c0de2zer0/studyquest`

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/c0de2zer0/studyquest)

### Manual Deploy Steps

1. **Sign in** to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `c0de2zer0/studyquest`
4. Railway auto-detects the Next.js config from `railway.json` and builds automatically
5. Once deployed, Railway assigns a `*.railway.app` URL — your app is live

### Environment Variables (if needed)

Add these under your project's **Variables** tab in Railway:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `18` (or `20`, `22`, `24`) |
| `NEXT_PUBLIC_API_URL` | Your app URL (if applicable) |

### What's Configured

- **`railway.json`** — Nixpacks builder, build + start commands, health check
- **`package.json`** — `"start": "next start"` script, `engines.node >= 18`
- Railway uses **Nixpacks** which auto-detects Next.js and handles the build

### Troubleshooting

- **Build fails**: Check the deploy logs in Railway Dashboard → your deployment → **Deploy Logs**
- **App crashes**: Railway shows live logs — look for runtime errors
- **Need a custom domain**: Railway Dashboard → Settings → Domains
