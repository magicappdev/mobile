# Mobile Agent Guide

## Scope

Treat `apps/mobile` as an independent repo/workflow surface inside this repository.

- For mobile-only work, use `apps/mobile` as the working root.
- Resolve relative paths from `apps/mobile`, not from the monorepo root.
- Mobile GitHub Actions live at `apps/mobile/.github/workflows/` in the monorepo. When operating within the mobile surface, interpret that as the mobile repo's `.github/workflows/`.
- Do not assume root `.github/workflows/`, root `.env`, or root package scripts are the correct target for mobile-only tasks.

## Practical Guardrails

1. Prefer commands in this form:

   ```bash
   cd apps/mobile && bun install
   cd apps/mobile && bun dev
   cd apps/mobile && bun typecheck
   ```

2. Use mobile-local paths in instructions and reviews:
   - `src/...`
   - `.github/workflows/...`
   - `.env`

   In monorepo terms those map to:
   - `apps/mobile/src/...`
   - `apps/mobile/.github/workflows/...`
   - `apps/mobile/.env`

3. Only switch back to monorepo-root paths when a task explicitly spans multiple apps/packages.

## Common Commands

Run these from `apps/mobile`:

```bash
bun install
bun dev
bun android
bun build
bun ionic:sync
bun run release
bun run release:dev
bun lint
bun typecheck
bun test.unit
bun test.e2e
```

## Key Directories

```text
apps/mobile/
├── .github/workflows/  # Mobile repo workflow files
├── src/                # App source
├── android/            # Native Android project
├── public/             # Static assets
├── capacitor.config.ts
└── package.json
```

## When In Doubt

- If the request says "mobile repo," assume `apps/mobile`.
- If a workflow path seems ambiguous, prefer `apps/mobile/.github/workflows/`.
- If a command only makes sense from the monorepo root, say so explicitly instead of assuming it.
- Mobile releases are repo-local: `bun run release` auto-bumps the patch version, builds, commits if needed, and pushes the `v<version>` tag created by `bun pm version patch`, while `bun run release:dev` auto-bumps patch and creates/pushes a `v<version>_dev` tag from the standalone mobile repo.
- Use `bun run release -- --dry-run` when you need to verify the next release flow without changing git state.
