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

### Current branch

Fresh post-change execution is **UNVERIFIED** until the final Compose validation gate is run against `feature/agent-skills`.

Do not treat the branch as submission-ready until the internal verification skill has been executed and every applicable assignment criterion has evidence.
