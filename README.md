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

Railway automatically detects and deploys each service. Deploy both `frontend` and `backend` services.

### Step 1: Deploy Backend First

1. In Railway, create a **New Project** → **Deploy from GitHub repo**
2. Select your repository
3. Railway will detect the monorepo structure
4. Add a new service for **Backend**:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `pnpm install --no-frozen-lockfile`
   - **Start Command**: `pnpm --filter @saas/backend start`
5. **Environment Variables** (Railway auto-injects `PORT`):
   - `NODE_ENV=production`
6. Deploy and wait for the backend to be live
7. **Copy the backend public URL** from Railway dashboard
   - Example: `https://saasbackend-production.up.railway.app`
8. Test the health endpoint: `https://<your-backend-url>/health`
   - Should return: `{"status":"ok"}`

**Note**: Backend uses `tsx` to run TypeScript directly (no build step needed). This handles path aliases automatically.

### Step 2: Deploy Frontend

1. In the same Railway project, add a new service for **Frontend**:
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `pnpm install --no-frozen-lockfile && pnpm --filter @saas/frontend build`
   - **Start Command**: `pnpm --filter @saas/frontend preview -- --host 0.0.0.0 --port $PORT`
2. **Environment Variables** (CRITICAL - set before deploying):
   - `VITE_API_URL=https://<your-backend-url>.up.railway.app`
   - Replace with your actual backend URL from Step 1
3. Deploy the frontend
4. **Copy the frontend public URL** from Railway dashboard
   - Example: `https://saasfrontend-production-4faf.up.railway.app`

**Important**: `VITE_API_URL` must be set **before** the build runs, as Vite bakes it into the bundle at build time.

### Current Deployment

**Frontend**: https://saasfrontend-production-4faf.up.railway.app/
**Backend**: Set `VITE_API_URL` to your backend Railway URL in the frontend service environment variables

### End-to-End Testing

Once both services are deployed on Railway:

1. **Test Backend Health**
   ```bash
   curl https://<your-backend-url>.up.railway.app/health
   # Expected: {"status":"ok"}
   ```

2. **Test WhatsApp Endpoint**
   ```bash
   curl -X POST https://<your-backend-url>.up.railway.app/whatsapp \
     -H "Content-Type: application/json" \
     -d '{"number": "+919876543210", "source": "test"}'
   # Expected: {"status":"accepted","submission":{...}}
   ```

3. **Test Frontend**
   - Open `https://saasfrontend-production-4faf.up.railway.app` in your browser
   - Enter a WhatsApp number (starts with +91 for India)
   - Watch the real-time validation and sync status updates
   - Check browser DevTools Network tab to verify API calls to your backend

4. **Verify End-to-End Flow**
   ```bash
   # After entering a number in the UI, check it was stored:
   curl https://<your-backend-url>.up.railway.app/whatsapp/latest
   # Expected: {"status":"ok","submission":{"number":"+...", ...}}
   ```

### Local-to-hosted parity

- Run everything locally with `pnpm --filter @saas/backend dev` and `pnpm --filter @saas/frontend dev`.
- Create a `.env` file in `apps/frontend` with `VITE_API_URL=http://localhost:3001` to test the integration locally.