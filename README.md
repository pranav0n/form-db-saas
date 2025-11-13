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

## Deployment (Render)

Render runs each folder as an independent web service. Create two services—`frontend` and `backend`—within the same Render account.

### Backend service

1. In Render, create a **New Web Service** and connect your repo.
2. Configure the service:
   - **Name**: `saas-backend` (or your choice)
   - **Root Directory**: `apps/backend`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install --no-frozen-lockfile`
   - **Start Command**: `pnpm --filter @saas/backend start`
3. **Environment Variables** (add in Render dashboard):
   - `NODE_ENV=production`
   - Render auto-injects `PORT`; the Express server already respects it
4. After deployment, confirm the health endpoint at `/health` returns `{ "status": "ok" }`.
5. **Copy the backend public URL** (e.g., `https://saas-backend.onrender.com`)

**Note**: Backend uses `tsx` to run TypeScript directly in production (no build step needed). This simplifies deployment and handles path aliases automatically.

### Frontend service

1. Create another **New Web Service** in Render and connect the same repo.
2. Configure the service:
   - **Name**: `saas-frontend` (or your choice)
   - **Root Directory**: `apps/frontend`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install --no-frozen-lockfile && pnpm --filter @saas/frontend build`
   - **Start Command**: `pnpm --filter @saas/frontend preview -- --host 0.0.0.0 --port $PORT`
3. **Environment Variables** (REQUIRED - add in Render dashboard):
   - `VITE_API_URL=https://<your-backend-service>.onrender.com`
   - Replace `<your-backend-service>` with your actual backend URL from step 1
4. **Important**: The `VITE_API_URL` must be set **before** the build runs, as Vite bakes it into the bundle at build time.
5. **Copy the frontend public URL** (e.g., `https://saas-frontend.onrender.com`)

### End-to-End Testing

Once both services are deployed on Render:

1. **Test Backend Health**
   ```bash
   curl https://<your-backend-url>.onrender.com/health
   # Expected: {"status":"ok"}
   ```

2. **Test WhatsApp Endpoint**
   ```bash
   curl -X POST https://<your-backend-url>.onrender.com/whatsapp \
     -H "Content-Type: application/json" \
     -d '{"number": "+14155552671", "source": "test"}'
   # Expected: {"status":"accepted","submission":{...}}
   ```

3. **Test Frontend**
   - Open `https://<your-frontend-url>.onrender.com` in your browser
   - Enter a WhatsApp number in the input field
   - Watch the real-time validation and sync status updates
   - Check browser DevTools Network tab to verify API calls to your backend

4. **Verify End-to-End Flow**
   ```bash
   # After entering a number in the UI, check it was stored:
   curl https://<your-backend-url>.onrender.com/whatsapp/latest
   # Expected: {"status":"ok","submission":{"number":"+...", ...}}
   ```

### Local-to-hosted parity

- Run everything locally with `pnpm --filter @saas/backend dev` and `pnpm --filter @saas/frontend dev`.
- Create a `.env` file in `apps/frontend` with `VITE_API_URL=http://localhost:3001` to test the integration locally.