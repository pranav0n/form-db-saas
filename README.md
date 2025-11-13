# Fullstack SaaS Monorepo

A minimal, fullstack SaaS application monorepo with minimal abstraction and code bloat.

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
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Monorepo**: Turborepo
- **UI**: Minimal component library

