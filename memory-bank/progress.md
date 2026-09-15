# Agent skills assignment progress

## Scope

This branch continues the inherited financial dashboard and applies reusable agent skills without changing the repository's core product scope or deployment model.

Branch: `feature/agent-skills`

## Skill discovery and selection

The discovery pass used `npx skills find` for the required skills and for at least two additional topics: `performance` and `testing`.

### 1. Accessibility

Selected: `jezweb/claude-skills@accessibility`

Reason: the skill is framework-agnostic, targets WCAG 2.1 AA, and maps directly to the current React/Vite dashboard without introducing a framework migration.

Applied in commit `dd93d2c`:

- loading state is exposed with `aria-busy` and a polite status announcement;
- API failures use an alert role;
- decorative dashboard/KPI icons are hidden from assistive technology;
- loading skeletons are treated as decorative while their containers expose useful loading labels;
- Recharts accessibility support is made explicit and custom tooltips expose live status text.

Accessibility audit notes:

- the dashboard has no user-operated buttons, links, inputs, or other interactive controls, so there is no additional keyboard-focus path to repair;
- no content images are present that require `alt` text; decorative icons are explicitly hidden from assistive technology;
- source-level contrast checks on the active dark theme exceed the 4.5:1 baseline for the reviewed normal-text pairs, including foreground/background (~16.9:1), muted text/card (~5.17:1), and KPI badge text/background pairs (~6.17:1 to ~6.88:1).

### 2. Vercel React Best Practices

Selected: `vercel-labs/agent-skills@vercel-react-best-practices`

Reason: this is the required React skill and the repository is React 19 + Vite. Next.js-only guidance is not applicable and was intentionally excluded.

Applied in commit `2a80c67` using the React re-render guidance to derive dashboard values during render instead of storing duplicate derived state in the fetch effect. The app now stores the fetched movements as the source state and calculates KPI/monthly data from that source.

### 3. Additional community skill

Selected from the `testing` discovery results: `wshobson/agents@javascript-testing-patterns`

Reason: it directly supports JavaScript/TypeScript, Vitest, and React testing patterns already present in this repository. It was preferred over adding Playwright/E2E tooling because this assignment does not require a new browser-testing stack and the existing frontend already has a Vitest validation path.

Applied in commit `c601cf1` by extending existing utility tests with explicit edge cases for empty KPI input and outcome-only monthly data. No new test dependency was introduced.

## Internal project skill

Created: `.skills/financial-dashboard-verification/SKILL.md`

Commit: `3b3d8f5`

The skill captures repository-specific verification knowledge that community skills do not know, including:

- Compose as the canonical runtime;
- service-specific frontend/backend checks;
- the previous host `node_modules` ownership problem;
- the Vite `/api` proxy contract;
- current-date-dependent generated metrics;
- evidence states of `PASS`, `FAIL`, and `UNVERIFIED`.

`AGENTS.md` now explicitly directs future agents to `.skills/` while retaining support for `.agents/rules/` and any agent-installed `.agents/skills/` directory.

## Validation state

### Baseline inherited from the context assignment

Previously verified on `main`:

- Compose configuration and startup;
- backend `/health` and `/docs`;
- 15 backend tests;
- frontend Vitest, ESLint, and production build inside Compose;
- frontend root on port 5173.

### Fresh post-change validation on `feature/agent-skills`

The internal verification skill was executed after all assignment changes.

| Check | Observed result | Status |
| --- | --- | --- |
| Compose build/start | backend and frontend images built; both containers started | PASS |
| Backend `/health` | `{"status":"ok"}` | PASS |
| Backend `/docs` | HTTP 200 | PASS |
| Frontend root | HTTP 200 | PASS |
| Frontend Vitest | 1 file passed, 7 tests passed | PASS |
| Frontend ESLint | completed without errors | PASS |
| Frontend production build | Vite build completed successfully | PASS |
| Git working tree after validation | clean | PASS |
| Backend pytest | not rerun because this assignment changed no backend behavior | NOT APPLICABLE |

The production build still reports the known chunk-size warning (about 585 kB minified). This is a warning, not a build failure, and the inherited baseline already documented the same warning class.

The first runtime HTTP check was attempted immediately after container startup and returned connection-level `HTTP 000`; after a short readiness delay, `/health`, `/docs`, and the frontend root all passed. This is recorded as startup timing rather than an application regression.

## Rubric audit

| Criterion | Evidence | Status |
| --- | --- | --- |
| Required accessibility skill discovered and applied | discovery output + commit `dd93d2c` | PASS |
| Accessibility outcomes verified | ARIA/loading/icon/chart changes; no interactive keyboard path exists; reviewed contrast pairs exceed baseline | PASS |
| Required Vercel React skill applied | commit `2a80c67`; Next.js-only guidance intentionally excluded | PASS |
| Frontend still validates | 7 Vitest tests, ESLint, production build | PASS |
| At least two ecosystem topics explored | `performance` and `testing` | PASS |
| Additional community skill selected and applied | `wshobson/agents@javascript-testing-patterns`; commit `c601cf1` | PASS |
| Internal project skill created under `.skills/` | `.skills/financial-dashboard-verification/SKILL.md` | PASS |
| Internal skill used on a real task | final branch validation ledger above | PASS |
| Memory bank updated | this file | PASS |
| Work isolated on required branch with traceable commits | `feature/agent-skills`, skill-specific commits | PASS |
| Submission artifact | pull request from `feature/agent-skills` to `main` | READY |

## Submission readiness

All applicable assignment criteria now have evidence. The branch is ready for a pull request against `main`. Do not merge the pull request before submission unless the instructor explicitly asks for it.
