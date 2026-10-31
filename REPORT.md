# Technical Report — Project Scoping & Instant Estimate Tool

**Subject:** cynbit.in
**Area improved:** Lead-capture UX, conversion, and functionality
**Author:** Full Stack Developer Intern Candidate

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
| Framework | **Next.js 14, App Router, TypeScript** | One codebase for frontend + API routes, matches what a small agency would actually deploy, and is already in Cynbit's own stated stack (their Services page lists Next.js under "Frameworks"). |
| Styling | **Tailwind CSS** | Also already in Cynbit's stated stack; fast to theme without adding a component library dependency. |
| State | **React `useState`** (no external state library) | The form has four steps and a flat shape — a reducer/store library would be overhead for this scope. |
| Validation | **Hand-written validation, duplicated as client checks + authoritative server checks** | Small, explicit surface area (6 fields); a schema library (e.g. Zod) would be the natural next step if the form grows. |
| Estimate logic | **A single pure function (`lib/estimate.ts`), imported by both the client and the API route** | This is the one piece of business logic in the app, and it must not live in two places that can drift — see §3.2. |
| Persistence | **In-memory array (`lib/store.ts`)** | Deliberately the simplest possible thing that demonstrates the real interface (`saveLead` / `listLeads`) without requiring a provisioned database for a take-home prototype. Documented as the first thing to swap before production (§4). |
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
Step 4: Contact details  ──POST /api/leads──▶  validate → recompute estimate → persist
  │                                                              │
  ◀──────────────── confirmation (server-computed estimate) ────┘
```

A "blueprint sheet" panel stays visible throughout and fills in with each
answer plus a live estimate range, so the visitor sees their scope and
budget fit forming in real time instead of discovering it after
submission.

### 3.2 Why the estimate logic is shared, not duplicated

The wizard shows a live estimate as the visitor answers questions — that
has to happen client-side for instant feedback. But a client-computed
number is, by definition, something a visitor's browser could tamper with
before it's submitted. `computeEstimate()` in `lib/estimate.ts` is written
once, imported by the React component for the live preview, and imported
again by `app/api/leads/route.ts`, which **recomputes the estimate from
only the service/scope/stage/timeline IDs the client sent** — never from a
client-supplied number — before anything is persisted. The function also
discards any submitted scope ID that doesn't belong to the chosen pillar,
so a crafted request can't pad the item count. This is a small-scale
version of a general principle: client-side logic is for UX, server-side
recomputation is what's actually trusted.

### 3.3 Estimate model

```
raw = (pillar.base + validScopeItemCount × 35) × stageMultiplier × timelineMultiplier
range = [raw × 0.85, raw × 1.25]
```

Base costs and multipliers live in `lib/domain.ts` as plain data, not
scattered through the component — tuning the numbers (which Cynbit would
need to do against their real rate card before launch) means editing one
table, not hunting through UI code. The figures shipped in this prototype
are illustrative placeholders; the UI says so explicitly ("Range only —
calibrated to Cynbit's real rate card before this ships") so the demo
doesn't misrepresent itself as a real quote.

### 3.4 Validation

`lib/store.ts` validates every field server-side independently of the
client (wrong/missing pillar, stage, or timeline ID; empty scope; name
under 2 characters; an email failing a basic regex) and returns field-level
errors with a `422` status, which the UI surfaces inline. The client
performs the same checks first purely to avoid round-trips, never as the
source of truth.

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

## 5. What I'd do next

1. Swap `lib/store.ts`'s in-memory array for Postgres (Cynbit's stack
   already lists Prisma/Supabase) so leads survive a deploy.
2. Add an email or Slack notification on submit — the API route has the
   exact spot marked for it.
3. Replace the hand-written validation with Zod, shared as the single
   schema for both client and server checks, once the form has more than
   six fields.
4. Calibrate `lib/domain.ts`'s base costs and multipliers against Cynbit's
   real rate card before this goes anywhere near real visitors.
5. Pre-select the pillar from the Services page's "Inquire" links (e.g.
   `/estimate?pillar=ai`) so a visitor coming from a specific service page
   doesn't have to re-state what they already told the site by clicking.
