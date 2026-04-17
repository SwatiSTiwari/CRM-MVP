# CRM Phase 1 MVP

A minimal viable CRM built with Next.js 15 (frontend) and NestJS 11 (backend).

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** NestJS 11 + TypeScript
- **Database:** MongoDB with Mongoose
- **Auth:** NextAuth.js (frontend) + JWT Passport (backend)
- **Data Fetching:** TanStack React Query + Axios

## Project Structure

```
.
├── backend/          # NestJS API
└── frontend/         # Next.js app
```

## Prerequisites

- Node.js 22+
- MongoDB running locally (default: `mongodb://localhost:27017`)
- npm

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env   # already provided; adjust MONGODB_URI if needed
npm install
npm run build
npm run start:dev
```

The backend will start on `http://localhost:3001` with API prefix `/api/v1`. An admin user is auto-seeded on first boot:
- Email: `admin@crm.local`
- Password: `admin123`

### 2. Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

The frontend will start on `http://localhost:3000`.

## Features (Phase 1)

- **Auth:** Login with credentials, JWT-protected API routes
- **Leads:** Create, edit, delete, search/filter/paginate leads
- **Activities:** Log calls, schedule meetings, create tasks from lead detail
- **Timeline:** Unified activity timeline per lead (calls, meetings, tasks)
- **Dashboard:** Today's tasks/calls/meetings + pipeline snapshot
- **AI Assistant (Mock):**
  - Chat panel (bottom-right FAB)
  - AI draft email from lead detail
  - Auto-generated call summary after logging a call

## Verification

Smoke-test the backend via curl or use the UI:
1. Login at `/`
2. Create a lead at `/leads`
3. Open lead detail, log a call, schedule a meeting, create a task
4. View unified timeline on lead detail
5. View tasks at `/activities/tasks`
6. View dashboard at `/dashboard`
# CRM-MVP
