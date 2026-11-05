# Cynbit Scoping Tool

A full-stack prototype that replaces a generic "name, email, message" contact form with a **Project Scoping & Instant Estimate wizard** — built as a proposed improvement to [cynbit.in](https://www.cynbit.in/).

## What it does

A visitor selects the service they need (Cynbit's four service pillars: AI automation, software development, cloud infrastructure, and SEO/marketing), the scope items, company stage, and timeline. They see an **illustrative estimate range update live**, then submit contact details. The API validates the input and recomputes the estimate server-side rather than trusting a client-provided amount. The structured lead is persisted in PostgreSQL through Supabase and Prisma.

## Stack

- **Next.js 15** (App Router, TypeScript) — frontend and API
- **Tailwind CSS** — styling
- **PostgreSQL (Supabase)** — persistent lead storage
- **Prisma ORM 6** — database access and migrations

## Project layout

```
app/
  page.tsx
  layout.tsx
  globals.css
  api/leads/route.ts
components/
  ScopingWizard.tsx
lib/
  domain.ts             Service pillars and scope items
  estimate.ts           Shared estimate calculation
  store.ts              Server validation and database persistence
  prisma.ts             Prisma Client singleton
  types.ts              Shared TypeScript types
prisma/
  schema.prisma         Lead database model
  migrations/           Database migration history
prisma.config.ts        Prisma CLI configuration
```

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and configure the Supabase PostgreSQL connection strings:

   ```env
   DATABASE_URL="your-supabase-transaction-pooler-url"
   DIRECT_URL="your-supabase-session-pooler-url"
   ```

   Use your own Supabase credentials. **Do not commit the `.env` file or expose database URLs.**

3. Generate Prisma Client and apply migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open <http://localhost:3000>.

## Deployment

The prototype is deployed on Vercel: <https://cynbit-scoping-tool.vercel.app>

Configure `DATABASE_URL` and `DIRECT_URL` as environment variables in the Vercel project before deploying database-backed functionality. Never use local `.env` credentials in source control.

## Known limitations

- **Estimate figures are illustrative placeholders.** The base costs and multipliers need to be calibrated against Cynbit's actual rate card before production use.
- **No email/Slack notification is wired up.** Notifications can be added after successful lead persistence.
- **No authenticated lead-management dashboard exists yet.** Lead retrieval should only be added behind appropriate authentication and authorization.
