# Demo Readiness Assessment — Investor / Buyer Perspective

> **Status:** Research complete
> **Date:** 2026-02-09
> **Goal:** Evaluate demo-adserver as a demonstration for investors or service buyers
> **Lens:** "Can this impress? Does this sell the vision? Does it inspire confidence?"

---

## Overall Demo Rating: B- (7/10)

**Verdict: Solid foundation with impressive breadth, but the demo story doesn't yet "flow" end-to-end. An investor would see a capable team building a real product, but would want to see the money move.**

---

## What an Investor/Buyer Looks At

| Criterion | Weight | Score | Verdict |
|-----------|--------|-------|---------|
| **"Wow" Factor — First Impression** | 25% | 7/10 | Good: 5 services, `docker-compose up` and it runs |
| **Feature Completeness / Story** | 25% | 6/10 | Wide but shallow — key flows use mock data |
| **Technical Credibility** | 20% | 8/10 | Clean architecture, tests, SDK, proper stack |
| **Demo Flow / Guided Experience** | 15% | 4/10 | No guided scenario, user left to figure it out |
| **Visual Polish / UX** | 15% | 6/10 | Decent Tailwind UI, but some rough edges |

---

## 1. First Impression — "Wow" Factor (7/10)

### What Works Well

**5-component ecosystem in one `docker-compose up`** — This is genuinely impressive. An investor sees:

```
docker-compose up -d
```

...and gets a running:
- Backend API (Go, PostgreSQL, Redis)
- Publisher Portal (Next.js)
- Advertiser Portal (Next.js)
- Demo Website (Next.js)
- Web SDK (<5KB)

This communicates: "the team can ship end-to-end." Very few demo projects show this breadth.

**Architecture diagram in README** — The ASCII art architecture in the Russian-language README immediately communicates what the product does. Good.

**Seed demo data** — Migrations auto-populate 6 banner formats with stylish gradient designs. The demo banners (Leaderboard, Medium Rectangle, Skyscraper, Half Page, Native) actually render nicely with modern CSS gradients and CTA buttons.

**`open-browsers.bat`** — A thoughtful touch. Opens all 4 portals + API health in the browser with a printed test flow guide. Shows demo awareness.

### What's Missing

**No macOS/Linux equivalent of `open-browsers.bat`** — The demo script is Windows-only (.bat). If you're demoing from a Mac (likely), you need a `.sh` equivalent.

**No demo video or screenshots in README** — A 30-second GIF or 3 screenshots of the portals would massively improve the first impression for anyone seeing the repo on GitHub.

---

## 2. Feature Completeness / Story (6/10)

### The Product Vision Is Clear

The README tells a compelling story for the Russian market:

| For Advertisers | For Publishers |
|----------------|----------------|
| 4-step campaign wizard | Website management |
| Banner upload (drag & drop, HTML5) | Code generation for integration |
| Targeting (geo, device, time, category) | Revenue stats by site/period |
| Budget control (hard caps, daily limits) | Real-time impression/revenue counter |
| Real-time stats (impressions, clicks, CTR) | — |

### The Reality Gap

Here's the problem: **much of this is UI shell without backend integration.**

| Feature | Claimed | Actual Status |
|---------|---------|---------------|
| Campaign wizard (4 steps) | YES | UI exists with form validation, BUT `formData` never hits the API — no campaign CRUD endpoints |
| Advertiser dashboard | YES | Uses `mockCampaigns` hardcoded data — not API-connected |
| Publisher dashboard | YES | API hooks exist (`useRealtimeStats`, `useQuery`), but backend doesn't serve these endpoints |
| Publisher placements table | YES | Renders "—" for all stats columns |
| Real-time stats | YES | `RevenueTicker` and `LiveSpendCounter` animate beautifully, but fed with mock/zero data |
| Banner delivery on demo site | YES | Actually works end-to-end via SDK → API → DB → rendered banner |
| Impression tracking | YES | Works (fire-and-forget POST) |
| Click tracking | YES | Works (302 redirect) |
| Auth (registration/login) | YES | Works end-to-end for both publishers and advertisers |
| Web SDK | YES | Fully functional, well-documented |

### The Demo Story That Works Today

```
1. docker-compose up -d                    ✅ Everything starts
2. Open demo-website (localhost:3000)      ✅ Landing page with features
3. Click "Live Demo"                       ✅ See real banners loading
4. Open publisher portal (localhost:3001)   ✅ Registration works
5. Register as publisher                   ✅ JWT token returned
6. See dashboard                           ⚠️ Empty (no data flows)
7. Open advertiser portal (localhost:3002)  ✅ Registration works
8. Create a campaign                       ⚠️ Wizard UI works but campaign never saves
9. See the campaign in demo website        ❌ No connection
```

**The critical gap: no end-to-end money story.** An investor wants to see: "Advertiser pays $X → ad shows on publisher site → publisher earns $Y." This loop doesn't close.

---

## 3. Technical Credibility (8/10)

### This Is Where the Project Shines

An investor or CTO doing due diligence would be impressed by:

| Signal | Rating | Detail |
|--------|--------|--------|
| **Clean Architecture** | A | Proper Domain → Application → Infrastructure → Presentation layers. Interfaces for DI. |
| **Test Coverage** | B+ | 20 test files across all layers. README claims 88% backend, 81% publisher portal. |
| **Web SDK** | A | <5KB gzipped, async loading, HTML sanitization, event system, retry logic, configurable via data attributes |
| **Stack Choice** | A | Go + PostgreSQL + Redis is a production-grade ad tech stack. Gin framework is battle-tested. |
| **Code Organization** | A | Small files, single responsibility, clear naming, proper Go project layout |
| **Multi-service Docker** | A- | Healthchecks on DB/Redis, proper networking, multi-stage builds |
| **CI/CD Scaffolding** | B- | GitHub Actions exist (build, test, lint, cross-platform, release) — shows intent even though broken |
| **Migrations** | B | 8 numbered up/down migration pairs, proper SQL with indexes |
| **Security Awareness** | B | JWT with validation, bcrypt cost=12, rate limiting, CORS config, input validation via Gin binding |

### What a Technical Buyer Would Probe

- "Why is the CI building a different binary than the Dockerfile?" — Awkward but fixable
- "Where are the integration tests?" — E2E tests exist (Playwright) but no DB integration tests
- "Why `mockCampaigns` in the advertiser portal?" — Shows features aren't connected yet

---

## 4. Demo Flow / Guided Experience (4/10)

### The Biggest Gap

There's no **guided demo scenario**. An investor sitting in a meeting needs:

> "Let me show you what happens when an advertiser creates a campaign."

Right now, the user has to:
1. Know which URLs to open
2. Know to register first
3. Figure out the wizard
4. Realize the data doesn't flow through

### What's Needed

**A "Happy Path" demo script** — a 5-minute guided walk-through, either:
- A physical script (markdown doc or presentation)
- Pre-populated demo accounts (so you skip registration)
- A "demo mode" toggle that shows realistic data
- Or at minimum: a seed script that populates campaigns, impressions, and revenue data

### Specific Friction Points

| Friction | Impact | Fix |
|----------|--------|-----|
| No pre-seeded user accounts | Must register each time | Add demo accounts in seed migration |
| No pre-seeded campaigns | Advertiser dashboard shows mock data or empty | Seed 3-5 realistic campaigns |
| No pre-seeded impressions/revenue | Publisher dashboard shows zeros | Seed historical data |
| No "quick demo" landing page | User doesn't know where to start | Create a `/demo-guide` page |
| No presentation deck | Can't hand off to non-technical stakeholders | Create 5-10 slide overview |

---

## 5. Visual Polish / UX (6/10)

### What Looks Good

**Advertiser Portal** — Tailwind CSS, consistent design, proper components:
- `LiveSpendCounter` with gradient bar and "Live" pulse indicator
- `CampaignList` with status badges (Активна, На паузе, На модерации)
- 4-step wizard with clear progression
- Russian-language labels throughout

**Publisher Portal** — Similar quality:
- `RevenueTicker` with blue-purple gradient, live indicator
- `StatsCards` with emoji icons and change percentages
- Website management with status badges (Ожидает верификации, Верифицирован)
- Skeleton loading states (animate-pulse)

**Demo Website Landing** — Clean hero section, feature cards, CTA sections.

### What Needs Work

**Demo Website layout.tsx is broken** — The layout uses `dangerouslySetInnerHTML` with inline CSS for basic styling, while the pages use Tailwind utility classes. These two systems conflict. The homepage uses `.container`, `.btn`, `.btn-primary` classes that are defined in Tailwind config but the layout overrides them with raw CSS. The demo page uses Tailwind-less inline styles. This creates visual inconsistency.

**No unified design system** — Publisher portal and advertiser portal each have their own `Button`, `Card`, `Input` components. They're similar but not shared. For a demo this is fine; for a product claim, it's a signal of duplication.

**Mobile responsiveness** — Pages use `md:grid-cols-3` and responsive utilities, which is good. But the demo banners have fixed pixel widths (728x90 etc.) which won't work on mobile.

**No dark mode** — Minor, but modern demos often include it.

---

## 6. README / Documentation Quality (7/10)

### Strengths

- Russian language (matches target market)
- Architecture diagram
- Feature matrix by stakeholder (advertiser vs publisher)
- Quick start with Docker
- API endpoint documentation
- Test commands for each component
- Coverage claims

### Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| README says `cd backend` — directory doesn't exist | Broken quick start | Fix to correct paths |
| README lists `POST /api/v1/track/click` — actual is `GET /api/v1/track/click/:impression_id` | API mismatch confuses technical evaluators | Update to match actual routes |
| README lists full campaigns CRUD — only delivery/tracking/demo exist | Overpromises features | Align with actual API |
| No screenshots | Reduces "scanability" for GitHub visitors | Add 3-4 screenshots |
| README claims "Drag & drop" banner upload — doesn't exist in code | Feature gap | Remove claim or implement |

---

## Summary Comparison: Production vs Demo

| Dimension | Production Grade | Demo Grade | Comment |
|-----------|-----------------|------------|---------|
| Security | F | N/A | Doesn't matter for a demo |
| Architecture | B+ | A- | Impressive for a demo |
| Feature Breadth | C | B+ | Wide scope, shows vision |
| Feature Depth | D | C | Mock data undercuts credibility |
| Visual Polish | C+ | B- | Good enough for a demo |
| Onboarding | D | D+ | Docker works; guided flow doesn't |
| Documentation | B- | B | Good README, some inaccuracies |
| "Ship Confidence" | D | B | Stack and code quality inspire confidence |
| **Overall** | **D+** | **B-** | Different audience, different score |

---

## What to Fix for a Killer Demo (Priority Order)

### Phase 1: Make the Story Flow (2-3 days)

These fixes transform the demo from "look at our code" to "watch the product work":

- [ ] **Seed demo accounts** — publisher@demo.com / advertiser@demo.com with password "demo1234"
- [ ] **Seed 5 campaigns with historical data** — impressions, clicks, revenue over 7 days
- [ ] **Connect advertiser dashboard to real API** — Replace `mockCampaigns` with API call
- [ ] **Add campaigns CRUD endpoints** — At minimum: list, create
- [ ] **Connect publisher dashboard stats** — Wire `useRealtimeStats` to actual impression data
- [ ] **Fix README paths and API docs** — Align documentation with reality

### Phase 2: Polish the Demo Experience (1-2 days)

- [ ] **Create `open-browsers.sh`** — macOS/Linux demo launcher script
- [ ] **Fix demo-website layout** — Remove inline CSS from `dangerouslySetInnerHTML`, use proper Tailwind
- [ ] **Add 3-4 screenshots to README** — Dashboard, wizard, demo site, banner formats
- [ ] **Write DEMO-GUIDE.md** — 5-minute guided walk-through for presenters
- [ ] **Add "Demo Mode" banner** — Visual indicator that this is a demo (builds trust, manages expectations)

### Phase 3: Visual Wow (2-3 days)

- [ ] **Add real-time impression counter on demo site** — Show a "12,345 impressions served" live counter
- [ ] **Populate publisher dashboard charts** — 7-day revenue chart with realistic data
- [ ] **Add campaign detail page with charts** — CTR over time, spend vs budget, geo breakdown
- [ ] **Make demo banners clickable** — Show the click tracking flow actually working
- [ ] **Add 30-second GIF to README** — Shows the full flow in motion

---

## Investor/Buyer Impression Forecast

### Current State: "Interesting, but show me it working"

An investor today would say:
> "Nice architecture. I can see the team knows what they're doing technically. But I can't see the actual product working end-to-end. Show me: advertiser creates a campaign, their ad shows up on a website, publisher sees the revenue. That's the business model. Where is it?"

### After Phase 1: "This is a real product"

An investor would say:
> "OK, I see it. The advertiser creates a campaign, the ad shows up on the demo site, the publisher dashboard shows revenue. The SDK is tiny and fast. The targeting works. This is a real ad tech stack that could serve traffic."

### After Phase 3: "Take my money"

An investor would say:
> "Beautiful dashboards, real-time stats, 6 ad formats, working SDK under 5KB, clean code, test coverage. This team can ship. The TAM for Russian ad tech is huge after the major platforms left. Let's talk terms."

---

*Assessment performed: 2026-02-09*
*Perspective: Non-technical investor + Technical CTO buyer*
