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

## Deployment (Railway)

Railway runs each folder as an independent service. Create two services—`frontend` and `backend`—within the same Railway project so they share networking and secrets.

### Backend service

1. In Railway, create a **Service → Empty Project** and select the repo.
2. When prompted for the service root, choose `apps/backend`.
3. Use the following commands:
   - **Install**: `pnpm install --frozen-lockfile`
   - **Build**: `pnpm --filter @saas/backend build`
   - **Start**: `pnpm --filter @saas/backend start`
4. Railway injects `PORT`; the Express server already respects it. Optionally add `.env` variables (e.g., `NODE_ENV=production`).
5. Confirm the health endpoint at `/health` returns `{ "status": "ok" }`.

### Frontend service

1. Add another service in the same Railway project and pick the repo again, this time setting the root to `apps/frontend`.
2. Configure commands:
   - **Install**: `pnpm install --frozen-lockfile`
   - **Build**: `pnpm --filter @saas/frontend build`
   - **Start**: `pnpm --filter @saas/frontend preview -- --host 0.0.0.0 --port $PORT`
3. Set the required environment variable pointing at the backend’s Railway URL:
   - `VITE_API_URL=https://<your-backend-service>.up.railway.app`
4. Railway serves the built Vite app via the preview server; for purely static hosting you can swap the start command for `npx serve apps/frontend/dist --listen $PORT`.

### Local-to-hosted parity

- Run everything locally with `pnpm --filter @saas/backend dev` and `pnpm --filter @saas/frontend dev`.
- Use the same `VITE_API_URL` pattern locally to mimic production (e.g., `.env` file with the backend tunnel URL).