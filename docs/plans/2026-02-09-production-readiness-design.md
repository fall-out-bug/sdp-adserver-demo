# Production Readiness Analysis — demo-adserver

> **Status:** Research complete
> **Date:** 2026-02-09
> **Goal:** Comprehensive audit of the demo-adserver repository's readiness for production deployment

---

## Table of Contents

1. [Overview](#overview)
2. [Security & Secrets Management](#1-security--secrets-management)
3. [Database & Data Layer](#2-database--data-layer)
4. [Infrastructure & Deployment](#3-infrastructure--deployment)
5. [Observability & Monitoring](#4-observability--monitoring)
6. [Error Handling & Resilience](#5-error-handling--resilience)
7. [Performance & Scalability](#6-performance--scalability)
8. [Testing & Quality](#7-testing--quality)
9. [CI/CD Pipeline](#8-cicd-pipeline)
10. [Dependency Management](#9-dependency-management)
11. [API Design](#10-api-design)
12. [Implementation Plan](#implementation-plan)
13. [Success Metrics](#success-metrics)

---

## Overview

### System Architecture

The demo-adserver is a multi-service ad serving platform:

| Component | Technology | Port |
|-----------|-----------|------|
| Backend API | Go 1.21 (Gin) | 8080 |
| PostgreSQL | 15-alpine | 5432 (internal) |
| Redis | 7-alpine | 6379 (internal) |
| Publisher Portal | Next.js | 3001 |
| Advertiser Portal | Next.js | 3002 |
| Demo Website | Next.js | 3000 |
| Web SDK | TypeScript (<5KB gzip) | CDN |

**Architecture**: Clean Architecture (Domain -> Application -> Infrastructure -> Presentation)
**Codebase**: ~12K LOC across Go, TypeScript, SQL
**Test files**: 20 Go test files across all layers

### Overall Verdict

| Dimension | Grade | Production-Ready? |
|-----------|-------|-------------------|
| **Security** | F | NO |
| **Database** | C | NO |
| **Infrastructure** | D | NO |
| **Observability** | F | NO |
| **Resilience** | D | NO |
| **Performance** | C- | NO |
| **Testing** | C+ | PARTIAL |
| **CI/CD** | F | NO (broken) |
| **Dependencies** | F | NO (CVEs) |
| **API Design** | B- | PARTIAL |

**Overall: NOT PRODUCTION-READY. Estimated effort to reach production: 3-4 weeks focused work.**

### Key Decisions Required

| Aspect | Decision |
|--------|----------|
| Secrets management | External vault (Vault/AWS SM) vs Docker secrets vs env files |
| TLS termination | Caddy/nginx reverse proxy vs in-app TLS |
| Observability stack | OpenTelemetry + Prometheus + Grafana (recommended) |
| Container orchestration | Docker Compose prod vs Docker Swarm vs Kubernetes |
| Migration tool | golang-migrate (recommended, fits existing file structure) |
| CI/CD platform | Fix existing GitHub Actions (fastest path) |

---

## 1. Security & Secrets Management

> **Experts:** Troy Hunt, Martin Kleppmann, Sam Newman

### P0 — CRITICAL (Block Deployment)

| # | Issue | Risk | Fix |
|---|-------|------|-----|
| 1 | **Hardcoded secrets in docker-compose.yml** — `JWT_SECRET=demo_jwt_secret...`, `DB_PASSWORD=password` | Anyone with repo access forges JWT tokens, owns database | Docker secrets / external vault; remove all secrets from source |
| 2 | **Redis has no authentication** — `NewClient(addr)` ignores password config | Network-adjacent attacker reads/writes cache, poisons banners | Wire `REDIS_PASSWORD` into `redis.Options`, set `requirepass` |
| 3 | **PostgreSQL SSL disabled** — `DB_SSLMODE=disable` default | All DB traffic (passwords, queries, PII) in plaintext | Default to `sslmode=verify-full` in production |
| 4 | **Internal errors exposed to clients** — 7 instances of `err.Error()` in HTTP responses | Leaks schema names, connection strings, internal architecture | Return generic errors with correlation IDs; log full details server-side |

### P1 — HIGH (Fix Before Launch)

| # | Issue | Risk | Fix |
|---|-------|------|-----|
| 5 | **CORS allows `null` origin with wildcard + credentials** | Cross-origin data theft via sandboxed iframes | Remove `"null"` from allowed origins; never use `*` with credentials |
| 6 | **No request body size limits** | OOM/DoS via multi-GB POST bodies | Add `MaxBytesReader` middleware (1MB registration, 64KB tracking) |
| 7 | **Open redirect in click handler** | Phishing using your domain as redirect source | Validate `ClickURL` at banner creation: enforce HTTPS, domain allowlist |
| 8 | **No security headers** | No HSTS, no CSP, no X-Frame-Options, no nosniff | Add security headers middleware |
| 9 | **Rate limiting trivially bypassable** — `X-Forwarded-For` trusted from any source | Rate limits meaningless behind any proxy | Call `router.SetTrustedProxies()` with specific load balancer IPs |
| 10 | **No HTTPS enforcement** — `ListenAndServe` only | All traffic including JWT tokens in plaintext | TLS termination at reverse proxy + HSTS |

### P2 — MEDIUM

| # | Issue | Fix |
|---|-------|-----|
| 11 | JWT: No issuer/audience claims, no revocation, no key rotation | Add `iss`, `aud`, `jti` claims; jti-based revocation in Redis; consider RS256 |
| 12 | Fire-and-forget goroutine with `context.Background()` | Bounded worker pool with lifecycle context |
| 13 | Weak uint32 hash in deduplication (code says "use crypto/sha256") | Use `crypto/sha256` |
| 14 | No specific rate limiting on auth endpoints | 5 failed attempts per account per 15 min; progressive lockout |
| 15 | No HTML sanitization on banner content — stored XSS | Sanitize with `bluemonday`; sandbox banner iframes |

### P3 — LOW

| # | Issue | Fix |
|---|-------|-----|
| 16 | Docker container runs as root | `RUN adduser -D appuser && USER appuser` |
| 17 | No password complexity beyond `min=8` | Add zxcvbn-style checking; check against common passwords |
| 18 | No anti-automation on registration | Email verification + CAPTCHA |
| 19 | JWT expiration 24h too long without revocation | Reduce to 15-30 min + refresh token flow |

---

## 2. Database & Data Layer

> **Experts:** Markus Winand, Martin Kleppmann

### Critical Issues

**N+1 Query in Hot Path** — `getBannersForCampaigns` loops over campaigns and queries banners individually. This is the ad delivery hot path.

```go
// CURRENT (N+1):
for _, c := range campaigns {
    bannerRepo.FindActiveForCampaign(ctx, c.ID) // 1 query per campaign
}

// FIX (single query):
bannerRepo.FindActiveByCampaignIDs(ctx, campaignIDs) // WHERE campaign_id = ANY($1)
```

**Migration Strategy Broken** — SQL files in `docker-entrypoint-initdb.d` only run on first empty volume. No rollback. No version tracking.

**Fix:** Adopt `golang-migrate/migrate` — the existing numbered up/down files already match its convention.

### Configuration Issues

| Issue | Current | Recommended |
|-------|---------|-------------|
| Connection pool idle | `MaxIdle=5` / `MaxOpen=25` | `MaxIdle=15` / `MaxOpen=25` (50%+ idle) |
| Connection lifetime | `ConnMaxLifetime=5min` | `ConnMaxLifetime=30min` + `ConnMaxIdleTime=5min` |
| SSL mode | `disable` | `verify-full` with CA cert |
| Health check | Static `{"status":"ok"}` | Ping DB + Redis, return 503 if degraded |

### Schema Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| `impressions.banner_id NOT NULL` + `ON DELETE SET NULL` — contradictory | DELETE fails at runtime | Make nullable or use `ON DELETE RESTRICT` |
| No `updated_at` triggers | Relies on app code, easily missed | Add PostgreSQL trigger function |
| No partitioning on `impressions`/`clicks` | Unbounded table growth | Partition by `timestamp` range (monthly) |
| `weightedRandomSelect` is deterministic | One banner monopolizes all traffic | Implement actual weighted random selection |

---

## 3. Infrastructure & Deployment

> **Experts:** Kelsey Hightower, Sam Newman

### Docker Issues

| Issue | Current | Fix |
|-------|---------|-----|
| Unpinned base image | `FROM alpine:latest` | `FROM alpine:3.19` |
| No resource limits | None on any service | Add CPU/memory limits to compose |
| No restart policies | Crash = permanent downtime | `restart: unless-stopped` |
| No backend healthcheck in compose | Orchestrator can't manage backend | Add healthcheck using `/health` endpoint |
| Container runs as root | No `USER` directive | Add non-root user |
| No network segmentation | All services on one bridge | Frontend/backend network split; `internal: true` for DB/Redis |

### Missing for Production

| Component | Status | Priority |
|-----------|--------|----------|
| TLS termination (Caddy/nginx) | Missing | P0 |
| Environment-specific configs (dev/staging/prod) | Missing | P1 |
| Volume backup strategy | Missing | P1 |
| Container image registry + push | Missing | P1 |
| Kubernetes/Swarm manifests | Missing | P2 |
| Auto-scaling | Missing | P2 |

---

## 4. Observability & Monitoring

> **Experts:** Charity Majors, Martin Kleppmann

### Current State

| Capability | Status |
|-----------|--------|
| Structured logging (zap) | YES (basic) |
| Request logging (method, path, status, duration, IP) | YES (no request ID) |
| Metrics (Prometheus/StatsD) | NO |
| Distributed tracing (OpenTelemetry) | NO |
| Alerting | NO |
| Correlation IDs | NO |
| Business metrics | NO |
| Deep health checks | NO |

### What to Add

**Priority 1 — Request ID middleware** (hours, massive value)
Add UUID per request, propagate to all logs. Enables debugging.

**Priority 2 — Prometheus RED metrics** (1 day)
`http_requests_total`, `http_request_duration_seconds`, `http_requests_in_flight`

**Priority 3 — Deep health checks** (hours)
`/health` must ping DB + Redis, return degraded status appropriately.

**Priority 4 — OpenTelemetry tracing** (2-3 days)
Instrument delivery + tracking hot paths.

**Priority 5 — Business dashboards + SLO alerts** (1-2 days)
Fill rate, impressions/sec, cache hit rate, P99 latency.

### Required Libraries

```
go.opentelemetry.io/otel
go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
github.com/prometheus/client_golang
```

---

## 5. Error Handling & Resilience

> **Experts:** Martin Kleppmann, Charity Majors

### Critical Resilience Failures

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| R1 | **Unbounded goroutines** — bare `go func()` in impression handler | OOM under load | Bounded worker pool with semaphore |
| R2 | **Rate limiter INCR+EXPIRE race** — two separate Redis commands | Permanent IP ban on crash between commands | Lua script (atomic) |
| R3 | **Redis failure = total outage** — rate limit middleware returns 500 on Redis error | Zero ad delivery when Redis is down | Degrade open: allow request on error |

### High Priority

| # | Issue | Fix |
|---|-------|-----|
| R4 | No DB/Redis retry on startup — fails once, process dies | Exponential backoff (1s, 2s, 4s, max 30s, 5 attempts) |
| R5 | No circuit breakers | `sony/gobreaker` on DB and Redis calls |
| R6 | No per-request timeout middleware | `context.WithTimeout(5s)` middleware |
| R7 | N+1 queries on cache miss | Batch query (see Database section) |

### Medium Priority

| # | Issue | Fix |
|---|-------|-----|
| R8 | No resource cleanup on shutdown — DB/Redis connections leak | Close DB and Redis in shutdown path |
| R9 | `gin.Recovery()` catches panics silently | Wire panic recovery to alerting |
| R10 | `weightedRandomSelect` is deterministic, not random | Implement proper weighted random with `math/rand` |

---

## 6. Performance & Scalability

> **Experts:** Brendan Gregg, Markus Winand

### Bottlenecks

| Bottleneck | Current Impact | Fix |
|-----------|---------------|-----|
| N+1 query in banner selection | O(N) DB calls per delivery | Single batch query |
| 100 RPM rate limit per IP | Low for legitimate ad serving | Tiered limits: delivery=1000/min, auth=10/min |
| No connection pooling for Redis | Default 10 pool size | Configure based on expected concurrency |
| Cache TTL hardcoded at 5 min | No flexibility for different banner types | Configurable TTL per slot type |
| `weightedRandomSelect` not random | One banner gets all traffic | Proper weighted random |
| No response compression | Larger payloads | Add gzip middleware |

---

## 7. Testing & Quality

> **Experts:** Kent C. Dodds

### Test Coverage

20 test files exist across all architecture layers:

| Layer | Test Files | Coverage |
|-------|-----------|----------|
| Domain entities | 4 | Advertiser, Campaign, Publisher, DemoBanner |
| Application services | 3 | Delivery (2), Tracking |
| Infrastructure | 5 | Redis (3), Postgres (1), Security (2) |
| Presentation | 5 | Handlers (3), Middleware (2) |
| Config/Bootstrap | 2 | Config, Bootstrap |

### Gaps

| Gap | Impact |
|-----|--------|
| No integration tests with real DB/Redis | Unit tests may pass with mocks but fail in production |
| No E2E tests for auth flow end-to-end | Registration/login bugs slip through |
| Quality gate TOML not enforced in CI | 80% coverage, LOC limits are aspirational only |
| No load testing | Unknown breaking point |
| No security testing (SAST/DAST) | Vulnerabilities unknown |

---

## 8. CI/CD Pipeline

> **Experts:** Kelsey Hightower, Filippo Valsorda

### THE CI IS FUNDAMENTALLY BROKEN

| Issue | Severity | Detail |
|-------|----------|--------|
| **Wrong binary** | P0 | CI builds `./cmd/sdp` — doesn't exist. Real binary is `./cmd/server` |
| **Fictitious Go version** | P0 | CI uses `go-version: '1.25.6'` — this version has never been released |
| **Quality gates never run** | P0 | `quality-gate.toml` and `ci-gates.toml` not referenced in any workflow |
| **Release workflow broken** | P1 | `go-release.yml` uses GoReleaser but no `.goreleaser.yml` exists |
| **Dependabot misconfigured** | P1 | Configured for `pip` (Python), not `gomod` (Go) |
| **No deployment pipeline** | P1 | No staging, production, canary, or container push |

### Immediate Fixes Required

1. `go build ./cmd/sdp` -> `go build ./cmd/server` in all CI jobs
2. `go-version: '1.25.6'` -> `go-version: '1.23'` (or `'stable'`)
3. Run `go mod tidy` to fix direct/indirect markers
4. Add `gomod` to Dependabot config
5. Create `.goreleaser.yml` or remove release workflow

---

## 9. Dependency Management

> **Experts:** Filippo Valsorda

### Critical: Known CVEs

| Dependency | Current | Risk |
|-----------|---------|------|
| `golang.org/x/crypto v0.5.0` | **3+ years old** | CVE-2023-48795 (Terrapin, High), CVE-2024-45337 (SSH bypass, Critical) |
| `golang.org/x/net v0.7.0` | Outdated | HTTP/2 rapid-reset DoS, other patches |
| `gin v1.9.0` | v1.10+ available | Security patches, router fixes |
| `go-redis v9.0.5` | v9.5+ available | Connection pool fixes |
| `golang-jwt v4.5.2` | v5.2+ available | Security improvements |

### All Dependencies Marked `// indirect`

Every dependency in `go.mod` is marked `indirect` — including direct imports like `gin`, `zap`, `go-redis`. This means `go.mod` was never properly generated from the source code. Run `go mod tidy`.

### Missing

- No SBOM generation
- No license scanning
- No `gomod` in Dependabot
- `govulncheck` in CI but CI doesn't actually run

---

## 10. API Design

> **Experts:** Theo Browne

### Strengths

- Clean REST API with versioning (`/api/v1/`)
- Proper HTTP methods (GET delivery, POST tracking, GET health)
- JWT-based auth with role-based access control
- Separate auth middleware per user type

### Issues

| Issue | Fix |
|-------|-----|
| No OpenAPI/Swagger spec | Generate from code or write spec-first |
| Error responses inconsistent (bare strings, no codes) | Standardize: `{"error": {"code": "ERR_XXX", "message": "..."}}` |
| No API versioning strategy beyond `/v1/` | Document breaking change policy |
| No pagination on list endpoints | Add `?page=&limit=` with `Link` headers |
| No request validation beyond Gin binding tags | Add explicit validation layer |

---

## Implementation Plan

### Phase 0: Emergency Fixes (1-2 days)

These are blocking deployment and have no dependencies:

- [ ] Fix CI: correct binary path, Go version, add gomod to Dependabot
- [ ] Update `golang.org/x/crypto` and `golang.org/x/net` to latest
- [ ] Run `go mod tidy`
- [ ] Remove hardcoded secrets from docker-compose.yml
- [ ] Fix rate limiter race condition (Lua script)
- [ ] Fix Redis-failure-causes-total-outage (degrade open)

### Phase 1: Security Hardening (3-5 days)

- [ ] Add TLS termination (Caddy reverse proxy)
- [ ] Enable PostgreSQL SSL
- [ ] Add Redis authentication
- [ ] Replace `err.Error()` in HTTP responses with generic messages
- [ ] Add security headers middleware
- [ ] Fix CORS null origin issue
- [ ] Add request body size limits
- [ ] Configure trusted proxies
- [ ] Add non-root user to Dockerfile
- [ ] Validate click URLs at banner creation
- [ ] Sanitize banner HTML (bluemonday)

### Phase 2: Resilience & Observability (5-7 days)

- [ ] Add request ID middleware + propagate to all logs
- [ ] Add Prometheus RED metrics
- [ ] Deep health checks (DB + Redis ping)
- [ ] Bounded worker pool for impressions
- [ ] Per-request timeout middleware
- [ ] Retry with backoff on startup
- [ ] Circuit breakers (sony/gobreaker)
- [ ] Graceful resource cleanup on shutdown
- [ ] Fix N+1 query in delivery path (batch query)
- [ ] Proper weighted random banner selection

### Phase 3: Infrastructure & CI/CD (3-5 days)

- [ ] Pin all Docker image versions
- [ ] Add resource limits and restart policies
- [ ] Backend healthcheck in docker-compose
- [ ] Network segmentation (internal networks)
- [ ] Environment-specific compose files
- [ ] Container image build + push in CI
- [ ] Wire quality gate configs into CI
- [ ] Adopt golang-migrate for schema migrations
- [ ] Volume backup strategy

### Phase 4: Polish & Scale Prep (5-7 days)

- [ ] OpenTelemetry tracing on hot paths
- [ ] Business metrics dashboards + SLO alerts
- [ ] JWT improvements (iss/aud/jti, shorter expiration, refresh tokens)
- [ ] Auth endpoint rate limiting + account lockout
- [ ] Table partitioning for impressions/clicks
- [ ] OpenAPI spec generation
- [ ] Load testing
- [ ] SBOM + license scanning
- [ ] Staging deployment pipeline

---

## Success Metrics

| Metric | Baseline (Current) | Target (Production) |
|--------|-------------------|-------------------|
| Security vulnerabilities (P0/P1) | 10+ | 0 |
| Known CVEs in dependencies | Multiple Critical | 0 Critical, 0 High |
| CI pipeline passing | NO (broken) | 100% green |
| Test coverage | Unknown (CI broken) | >= 80% |
| Health check depth | Static OK | DB + Redis verified |
| Metrics collection | None | RED metrics + business KPIs |
| P99 ad delivery latency | Unknown | < 50ms |
| Cache hit rate | Unknown | > 80% |
| Mean time to detect (MTTD) | Infinite (no alerting) | < 5 minutes |
| Rate limiter correctness | Race condition | Atomic (Lua script) |
| Graceful degradation | Redis down = total outage | Redis down = degraded service |
| Secrets in source control | YES | ZERO |
| TLS coverage | 0% | 100% |

---

*Analysis performed: 2026-02-09*
*Experts consulted: Troy Hunt (Security), Markus Winand (Database), Kelsey Hightower (DevOps), Charity Majors (Observability), Martin Kleppmann (Distributed Systems), Brendan Gregg (Performance), Kent C. Dodds (Testing), Theo Browne (API Design), Filippo Valsorda (Supply Chain Security), Sam Newman (Architecture)*
