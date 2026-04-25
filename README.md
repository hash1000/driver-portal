# Driver Jobs Portal

A Next.js + TypeScript project that includes:

- Shared login for drivers and admin
- Driver setup (contract, vehicle, date)
- Driver flows for live jobs, completion, fuel entries, and issue reports
- Admin hub with overview, driver management, site management, and driver folders
- Central MySQL database storage via Prisma
- API routes for login and portal data/actions

## Run Locally

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

App URL:

- http://localhost:3000

## Build

```bash
npm run build
```

## Database

- Prisma schema: `prisma/schema.prisma`
- Portal API routes:
	- `app/api/login/route.ts`
	- `app/api/portal/route.ts`

Jobs, completed jobs, fuel entries, reports, drivers, and site/contract changes are saved server-side in MySQL instead of browser local storage.

## Test Credentials

- Admin: `admin` / `password123`
- Driver examples: `driver01` to `driver20` / `password123`

## Main Files

- `app/page.tsx` - main Driver Jobs Portal UI
- `components/ui/*` - local UI primitives used by the portal
- `lib/portal-config.ts` - shared portal types and defaults
- `lib/portal-server.ts` - Prisma-backed portal data shaping and initial seeding
- `lib/prisma.ts` - Prisma client setup
