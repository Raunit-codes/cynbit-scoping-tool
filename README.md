# Cynbit Scoping Tool

A full-stack prototype that replaces a generic "name, email, message" contact
form with a **Project Scoping & Instant Estimate wizard** — built as a
proposed improvement to [cynbit.in](https://www.cynbit.in/).

## What it does

A visitor picks the service they want (mirroring Cynbit's real four service
pillars: AI automation, software development, cloud infrastructure, SEO &
marketing), the specific scope items within it, their company stage, and
timeline. They see an **illustrative estimate range update live** as they
go, then submit their contact details. The submission is validated and the
estimate is **recomputed server-side** (the client's number is never
trusted) before being stored as a structured, pre-qualified lead.

## Stack

- **Next.js 14** (App Router, TypeScript) — one codebase, frontend + API
- **Tailwind CSS** — styling, using Cynbit's own stated tech stack
- Zero external services — the estimate logic and lead store are plain
  TypeScript, so there's nothing extra to configure to run this locally

## Project layout

```
app/
  page.tsx            Home page — renders the wizard
  layout.tsx           Root layout, font loading
  globals.css           Design tokens (light/dark) + Tailwind
  api/leads/route.ts     POST (submit + validate + persist) / GET (list)
components/
  ScopingWizard.tsx      The wizard UI (client component)
lib/
  domain.ts            Cynbit's four service pillars + their scope items
  estimate.ts          Pure estimate calculation (shared client + server)
  store.ts             Server-side validation + in-memory lead storage
  types.ts             Shared TypeScript types
```

## Running locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Deploying


<<<<<<< HEAD
=======

>>>>>>> 1a3fdcc2cbf858d925f58b64fae3b44f604609f8
## Known limitations (by design, for a prototype)

- **Leads are stored in memory** (`lib/store.ts`), so they reset on every
  server restart / serverless cold start. Swap `saveLead` / `listLeads` for
  a real table — Cynbit's own services page already lists Postgres,
  Prisma, and Supabase, any of which would drop in behind the same two
  functions.
- **No email/Slack notification is wired up** — the API route has a
  comment marking exactly where to add one once real credentials exist.
- **Estimate figures are illustrative placeholders.** The base costs and
  multipliers in `lib/estimate.ts` are structured to be easy to tune, but
  the actual numbers need to come from Cynbit's real rate card before this
  ships to real visitors.
