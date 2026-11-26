# frontier-kickstarter

Minimal example Frontier OS app (Vite + TypeScript) showing the Frontier Wallet SDK. Public, MIT, meant to be cloned by external developers. Org-wide rules: [repo standards](https://github.com/BerlinhouseLabs/berlinhouse-labs/blob/staging/index/guidelines/repo-standards.md). Open PRs against `staging`; `main` only takes release PRs. This repo is public: never commit secrets, internal hostnames or internal process detail.

## Hard rules

1. **Keep it minimal and readable.** It is a teaching example; don't add frameworks or abstractions.
2. **Keep `@frontiertower/frontier-sdk` pinned to an exact version** in `package.json` and the lockfile in sync (`npm ci` must pass). Bump it together with the code that uses its API.
3. **Don't loosen `vercel.json` headers** (CORS origin, CSP `frame-ancestors`): they decide which wallet hosts may embed the app.
4. **Docs for agents live in `docs/`** (`AGENT_INSTRUCTIONS.md`, `DEPLOYMENT.md`, `WEBHOOKS.md`); keep them consistent with `src/main.ts` and the SDK version.

## Commands

```bash
npm ci
npm run dev       # Vite on :5174
npx tsc --noEmit  # CI runs this
npm run build     # CI runs this
```

No tests exist. `vite build` does not type-check, so CI runs `tsc --noEmit` before the build.

## Map

- `src/main.ts`, `src/style.css`, `index.html`: the whole app
- `vite.config.ts`: dev server and CORS origins; `vercel.json`: hosting headers
- `docs/`: agent instructions, deployment guide, webhooks

## Deploys and rollback

Nothing deploys from this repo's CI. Revert through a normal PR.

## Exceptions to the org repo standards

- No tests, lint or format checks, coverage floor or dependency audit yet (CI type-checks and builds).
