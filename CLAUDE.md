# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**demo-adserver** - Demo Ad Server project using **SDP (Spec-Driven Protocol)** framework for AI-driven development.

This project uses SDP v0.6.0 - a workstream-driven development framework that transforms AI coding tools into a structured software development process.

## Development Framework: SDP

SDP provides a complete development workflow with multi-agent orchestration:

### Four-Level Planning Model

```
Strategic Level          Analysis Level           Feature Level           Execution Level
@vision (7 agents)  →  @reality (8 agents)  →  @feature (@idea+@design)  →  @oneshot (@build)
```

| Level | Command | Purpose | Output |
|-------|---------|---------|--------|
| **Strategic** | `@vision "idea"` | Product planning | VISION, PRD, ROADMAP |
| **Analysis** | `@reality --quick` | Codebase analysis | Reality report |
| **Feature** | `@feature "add X"` | Requirements + workstreams | Workstream files |
| **Execution** | `@oneshot F01` | Parallel execution | Implemented code |

### Core Skills

| Skill | Purpose | Example |
|-------|---------|---------|
| `@vision` | Strategic product planning (7 expert agents) | `@vision "AI-powered ad server"` |
| `@reality` | Codebase analysis (8 expert agents) | `@reality --quick` |
| `@feature` | Planning orchestrator (interactive) | `@feature "Add real-time bidding"` |
| `@idea` | Requirements gathering | `@idea "Add user auth"` |
| `@design` | Workstream design | `@design idea-auth` |
| `@oneshot` | Execution orchestrator (autonomous) | `@oneshot F01` |
| `@build` | Execute single workstream (TDD) | `@build 00-001-01` |
| `@review` | Multi-agent quality review | `@review F01` |
| `@deploy` | Merge feature branch to main | `@deploy F01` |
| `/debug` | Systematic debugging | `/debug "Test fails"` |
| `@issue` | Debug and route bugs | `@issue "Login fails"` |
| `@hotfix` | Emergency fix (P0) | `@hotfix "Critical bug"` |
| `@bugfix` | Quality fix (P1/P2) | `@bugfix "Incorrect totals"` |

### Typical Workflow

```bash
# 1. Strategic planning (for new projects or quarterly reviews)
@vision "Real-time bidding ad server"

# 2. Analysis phase (understand current state)
@reality --quick

# 3. Planning phase (per feature)
@feature "Add real-time bidding support"
# → Creates workstreams in docs/workstreams/backlog/

# 4. Execution phase (autonomous)
@oneshot F01
# → Executes all workstreams with TDD, quality gates, and review
```

## Task Tracking: Beads

This project uses **Beads CLI** for task tracking:

```bash
# Install Beads (if not installed)
brew tap beads-dev/tap && brew install beads  # macOS
curl -sSL https://raw.githubusercontent.com/beads-dev/beads/main/install.sh | bash  # Linux

# Common commands
bd ready              # Find available work (no blockers)
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
bd stats              # Project statistics
```

### Beads + SDP Integration

When using SDP skills:
- Before `@build`: Update issue status
- After `@build`: Run `bd sync` before commit
- After `@design`: Migrate workstreams to Beads

## Quality Gates

All code must pass:

| Gate | Requirement |
|------|-------------|
| **AI-Readiness** | Files < 200 LOC, cyclomatic complexity < 10 |
| **TDD** | Tests first (Red → Green → Refactor) |
| **Coverage** | ≥80% test coverage |
| **Type Safety** | Full type hints (mypy --strict for Python) |
| **Error Handling** | No `except: pass` or bare exceptions |

## Project Structure

```
demo-adserver/
├── .claude/
│   ├── agents/           # Multi-agent definitions (24+ agents)
│   ├── skills/           # Skill definitions (@vision, @build, etc.)
│   └── hooks/            # Git hooks for validation
├── .beads/               # Beads task tracking data
├── docs/
│   ├── workstreams/      # Workstream definitions
│   │   ├── backlog/      # Pending workstreams
│   │   ├── in_progress/  # Active workstreams
│   │   └── completed/    # Finished workstreams
│   ├── drafts/           # @idea outputs
│   └── specs/            # Feature specifications
├── src/
│   └── sdp/              # SDP framework (Go plugin)
│       ├── graph/        # Dependency graph, parallel execution
│       ├── vision/       # @vision implementation
│       ├── reality/      # @reality implementation
│       └── synthesis/    # Multi-agent synthesis
├── sdp-plugin/           # Go binary (optional automation)
└── PRODUCT_VISION.md     # Project manifesto
```

## Architecture

SDP uses **Clean Architecture** principles:

```
Domain Layer (entities, business rules)
    ↓
Application Layer (use cases, services)
    ↓
Infrastructure Layer (DB, APIs, external services)
    ↓
Presentation Layer (APIs, UI)
```

### Workstream Hierarchy

```
Release (product milestone)
  └─ Feature (5-30 workstreams)
      └─ Workstream (atomic task, one-shot)
          ├─ SMALL: < 500 LOC
          ├─ MEDIUM: 500-1500 LOC
          └─ LARGE: > 1500 LOC (split into 2+)
```

## Development Commands

### Python Development (deprecated SDP)

```bash
# Install dependencies (if using Python SDP)
poetry install

# Run tests
poetry run pytest

# Run quality checks
poetry run ruff check src/
poetry run mypy src/
```

### Go Development (SDP Plugin)

```bash
# Build Go plugin
cd sdp-plugin
go build -o sdp ./cmd/sdp

# Run tests
go test ./...
```

## Critical Rules

**Forbidden:**
- ❌ `except: pass` or bare exceptions
- ❌ Files > 200 LOC
- ❌ TODO without creating a workstream
- ❌ Editing without active workstream
- ❌ Skipping TDD cycle

**Required:**
- ✅ TDD (Red → Green → Refactor)
- ✅ Coverage ≥80%
- ✅ Type hints everywhere
- ✅ Explicit error handling
- ✅ Clean architecture boundaries
- ✅ Conventional commits

## Session Completion Protocol

**When ending a work session**, you MUST complete ALL steps:

1. **File issues** for remaining work
2. **Run quality gates** (tests, linters)
3. **Update issue status** (close finished, update in-progress)
4. **PUSH TO REMOTE** (MANDATORY):
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** stashes and branches
6. **Verify** all changes committed AND pushed

**CRITICAL:** Work is NOT complete until `git push` succeeds. Never leave work stranded locally.

## Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | SDP overview and quick start |
| [PROTOCOL.md](docs/PROTOCOL.md) | Full SDP specification |
| [CLAUDE.md](CLAUDE.md) | This file - Claude Code integration |
| [.cursorrules](.cursorrules) | Project-specific rules |
| [docs/SITEMAP.md](docs/SITEMAP.md) | Documentation index |

## Resources

- **SDP Documentation:** See [docs/](docs/) for complete guides
- **Skill Definitions:** See [.claude/skills/](.claude/skills/)
- **Agent Catalog:** See [.claude/agents/README.md](.claude/agents/README.md)
- **Beads Documentation:** See [.beads/README.md](.beads/README.md)

---

**Version:** SDP 0.6.0 (Unified Workflow)
**Last Updated:** 2026-02-07
