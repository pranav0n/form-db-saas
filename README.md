# Fullstack SaaS Monorepo

A fullstack SaaS application monorepo with minimal abstraction that now ships with the coss.com UI component library by default.

## Structure

```
workspace/
├── apps/
│   ├── frontend/     # Frontend application
│   └── backend/      # Backend API server
└── packages/
    └── shared/       # Shared utilities and types
```

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Monorepo**: Turborepo
- **UI**: coss.com UI component library

## Deployment

### Frontend → Vercel

1. Install dependencies once locally: `pnpm install`.
2. Create a new Vercel project pointing to this repo (monorepo detection will read `vercel.json`).
3. Set build output:
   - Install Command: `pnpm install --frozen-lockfile`
   - Build Command: `pnpm --filter @saas/frontend build`
   - Output Directory: `apps/frontend/dist`
4. Define environment variables (Production + Preview):
   - `VITE_API_URL=https://<your-backend-host-or-tunnel>`
5. Trigger the deploy from Vercel or via `vercel --prod`.

The frontend references `import.meta.env.VITE_API_URL`; without it, it will fall back to `http://localhost:3001`, which only works during local development.

### Backend (local-first)

- Run locally while iterating: `pnpm --filter @saas/backend dev` (listens on `http://localhost:3001`).
- To let the hosted Vercel frontend hit your local backend, start a secure tunnel (e.g., `cloudflared tunnel run`, `ngrok http 3001`, or `inlets`). Use the tunnel URL as `VITE_API_URL`.

### Cheap backend hosting options

If exposing your local machine isn’t viable, spin up a low-cost hosted instance:

- **Railway.app** free tier: deploy `apps/backend`, set `PORT` env, and connect your Postgres/Redis later if needed.
- **Render free web service**: build command `pnpm install && pnpm --filter @saas/backend build`, start command `pnpm --filter @saas/backend start`.
- **Fly.io**: `fly launch --dockerfile` with a minimal Node 20 image; good for global edge affinity.

Once deployed, update `VITE_API_URL` on Vercel to the public backend URL and redeploy the frontend to sync configuration.