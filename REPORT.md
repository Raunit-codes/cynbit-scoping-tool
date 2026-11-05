# Technical Report — Project Scoping & Instant Estimate Tool

**Subject:** cynbit.in
**Area improved:** Lead-capture UX, conversion, and functionality
**Author:** Raunit Bakshi

---

## 1. Problem statement

### 1.1 Site review

[cynbit.in](https://www.cynbit.in/) is the marketing site for Cynbit
Technologies, a Jaipur-based agency offering four distinct service lines —
AI automation & agents, full-stack software development, cloud
infrastructure, and technical SEO/digital marketing — plus a training
program (BitElevate) and a small SaaS product suite.

**From a user's perspective**, the site's entire lead-capture surface is a
single generic form (`/contact`): Full Name, Email, Company (optional),
Industry (optional), and one free-text "Your Message" box. Every "Inquire"
link on the Services page — regardless of whether the visitor clicked on
*AI voice agents* or *technical SEO* — routes to this same undifferentiated
form, with no memory of which service the visitor came from.

This is a real conversion problem, for three reasons specific to this
business:

1. **The four service lines have almost nothing in common.** A prospect
   evaluating an AI voice agent and a prospect evaluating a technical SEO
   audit have completely different budgets, timelines, and vocabulary. A
   single free-text box forces both to self-serve structure that the form
   should be providing.
2. **B2B buyers commonly abandon contact forms when they can't gauge
   budget fit before a call.** Asking a visitor to write a paragraph and
   wait for a reply, with no sense of whether they're in the right price
   range, is a known drop-off point for services businesses.
3. **The resulting leads are low-context.** Cynbit's team has to manually
   re-ask the qualifying questions the form could have asked (what kind of
   project, what stage, what timeline) before they can even scope a
   response — adding friction and delay on both sides.

**From a developer's perspective**, the site is a well-built modern Next.js
app with correct OG/meta tags. One smaller issue worth noting: a number of
interactive UI elements (icons, the newsletter control) render via an icon
font/ligature pattern that degraded to literal words (`arrow_forward`,
`hub`, `east`, etc.) when fetched as raw text — a sign those elements may
not be fully robust for crawlers or assistive technology. This is a
secondary finding; the contact-flow problem above is the one this project
addresses.

### 1.2 Why this area, specifically

Of the areas listed in the brief (functionality, UX, performance,
conversion, interaction, new capability), the contact form touches **four
of the six at once**: it's a functionality gap (no structured intake), a
UX problem (one-size-fits-all), a conversion problem (no budget signal,
generic CTA), and an interaction opportunity (a company that sells AI
automation has a manual, un-automated lead flow). That combination made it
the highest-leverage single change to prototype.

---

## 2. Technical stack choices

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15, App Router, TypeScript** | One codebase for frontend and API routes. Next.js is also part of Cynbit's stated technology stack. |
| Styling | **Tailwind CSS** | Also already in Cynbit's stated stack; fast to theme without adding a component library dependency. |
| State | **React `useState`** (no external state library) | The form has four steps and a flat shape — a reducer/store library would be overhead for this scope. |
| Validation | Server-side validation with field-specific API errors | The API validates submitted values independently of the browser. The current UI provides basic step-selection constraints, while authoritative validation happens on submission. |
| Estimate logic | **A single pure function (`lib/estimate.ts`), imported by both the client and the API route** | This is the one piece of business logic in the app, and it must not live in two places that can drift — see §3.2. |
| Persistence | **PostgreSQL (Supabase) with Prisma ORM 6** | Leads are persisted in a relational database rather than an in-memory array, so records survive server restarts and serverless instance lifecycles. Prisma provides the schema, client, and migration workflow. |
| Deployment target | **Vercel** | Zero-config for a Next.js app; matches how a company this size would actually ship it. |

---

## 3. Implementation

### 3.1 Flow

```
Visitor
  │
  ▼
Step 1: Service      (one of Cynbit's 4 real pillars)
  │
  ▼
Step 2: Scope         (multi-select, pillar-specific items)
  │
  ▼
Step 3: Stage + timeline
  │
  ▼
Step 4: Contact details  ──POST /api/leads──▶  validate → recompute estimate → persist in PostgreSQL
  │                                                              │
  ◀──────────────── confirmation (server-computed estimate) ────┘
```

A "blueprint sheet" panel stays visible throughout and fills in with each
answer plus a live estimate range, so the visitor sees their scope and
budget fit forming in real time instead of discovering it after
submission.

### 3.2 Why the estimate logic is shared, not duplicated

The wizard displays a live estimate as the visitor answers questions, which requires client-side calculation for immediate feedback. However, a client-computed number can be modified before submission.

`computeEstimate()` in `lib/estimate.ts` is written once and imported by the React component for the live preview. On submission, the API validates the submitted service, scope, stage, and timeline IDs. The validated data is passed to `saveLead()` in `lib/store.ts`, which calls the same `computeEstimate()` function again on the server.

The server therefore calculates the stored estimate from validated inputs rather than trusting a client-supplied estimate. This follows a general principle: client-side calculations support user experience, while server-side calculations determine the trusted result.

### 3.3 Estimate model

```text
raw = (pillar.base + validScopeItemCount × 35)
      × stageMultiplier
      × timelineMultiplier

low  = roundToNearest5(raw × 0.85)
high = roundToNearest5(raw × 1.25)
```

All monetary values are represented in thousands of Indian rupees (INR).

Base costs and multipliers live in `lib/domain.ts` as plain data, while the calculation and rounding logic live in `lib/estimate.ts`. Tuning the numbers against Cynbit's real rate card means editing the domain data rather than searching through UI code.

The figures shipped in this prototype are illustrative placeholders. The UI explicitly communicates that the estimate must be calibrated against Cynbit's real rate card before production use.

### 3.4 Validation and persistence

`lib/store.ts` contains the authoritative server-side validation logic. The API route returns structured validation errors with a `422` status when submitted data is invalid.

Specifically, the server:

- Rejects missing or unrecognized pillar, stage, or timeline IDs.
- Rejects an empty scope selection and scope IDs that do not belong to the selected service pillar.
- De-duplicates scope IDs before storage, preventing duplicate selections from inflating the estimate.
- Enforces a minimum name length of two characters and maximum lengths for name, email, company, and industry.
- Validates the email format.
- Returns a `500` response if lead persistence fails.

The API returns field-specific validation errors, although the current UI displays the first returned error message rather than mapping errors individually to their corresponding inputs.

One deliberate removal: an earlier version exposed an unauthenticated `GET /api/leads` endpoint that returned submitted lead information. This endpoint has been removed. The current API only exposes `POST /api/leads`; an authenticated internal lead-management interface remains future work.

Validated lead records are now persisted in PostgreSQL hosted by Supabase using Prisma. The Prisma schema defines the lead data model, and the migration history records the database schema changes. The database connection is configured through `DATABASE_URL` and `DIRECT_URL` environment variables; these credentials must not be committed to source control.

---

## 4. Results

This is a prototype, not a feature running against live traffic, so the
honest version of "results" is: what's been built and verified, plus what
should be measured once it's live — rather than invented analytics.

**What's demonstrated:**
- A structured lead (service + scope + stage + timeline + contact info)
  replaces one free-text box, with no increase in the number of fields a
  visitor types by hand — the extra structure comes from selection, not
  extra typing.
- The estimate is computed identically, and independently, on client and
  server, and the server never trusts a client-submitted number.
- The flow degrades gracefully: invalid submissions return field-specific
  errors instead of a generic failure.
- Supabase/PostgreSQL persistence was tested end-to-end: a lead was submitted
  through the wizard and successfully appeared in the Supabase `leads` table.

**What should be measured once deployed**, to turn this from "plausibly
better" into "measurably better":
- Form start rate vs. the old `/contact` form (does framing it as "get an
  instant estimate" draw more clicks than "send us a message"?).
- Completion rate per step (where do people actually drop off — this also
  tells Cynbit which question is the biggest friction point).
- Lead-to-qualified-call ratio, compared against the current manual
  re-qualification process.

A straightforward way to get this data without betting the whole contact
page on it: ship this wizard at a new route (e.g. `/estimate`), link to it
alongside the existing `/contact` form for a few weeks, and compare.

---

## 5. Revision history

**Round 1 (initial prototype):** wizard, estimate engine, API route,
in-memory store, this report.

**Round 2 (hardening pass) — done:**
- Removed the unauthenticated `GET /api/leads` endpoint.
- Added `try/catch` around lead persistence, returning `500` on failure
  instead of an unhandled error.
- Server now rejects scope IDs that don't belong to the selected pillar
  (previously these were silently dropped inside the estimate calculation
  rather than rejected at the validation layer).
- Scope IDs are de-duplicated before storage; `computeEstimate()` also
  de-dupes independently as a second layer.
- Added length limits on name, email, company, and industry.

**Round 3 (database integration) — done:**
- Replaced in-memory lead storage with PostgreSQL persistence using Supabase and Prisma.
- Added the Prisma lead model and migration.
- Added Prisma Client initialization and connected it to the lead-saving function.
- Updated the API route to await database persistence.
- Verified a submitted wizard lead appears in Supabase's `leads` table.

## 6. What I'd do next

1. **Email or Slack notifications.** Add a notification integration after successful lead persistence, using securely configured credentials and environment variables.
2. Replace the hand-written validation with Zod, using a shared schema for client-side and server-side validation as the form grows.
3. Calibrate `lib/domain.ts`'s base costs and multipliers against Cynbit's real rate card before production use.
4. Pre-select the pillar from the Services page's inquiry links (e.g. `/estimate?pillar=ai`) so visitors do not have to select a service they have already expressed interest in.
5. Build an authenticated internal dashboard for reviewing submitted leads. Lead retrieval should only be exposed through appropriately authenticated and authorized functionality.
