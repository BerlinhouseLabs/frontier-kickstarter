# Frontier Sponsor Pass Manager

A crisp, UI-first prototype for managing sponsor passes with the Frontier SDK. It ships with sponsor switching, pass creation, revocation, pagination, and a modern glassy interface designed for the Frontier App Store sandbox.

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Run the dev server (bound to the sandbox-friendly port)
   ```bash
   npm run dev -- --host --port 5437
   ```
3. Open `http://localhost:5437` or load the app inside `sandbox.wallet.frontiertower.io` after installing from the App Store.

> The app uses Frontier SDK permissions for partnerships (list sponsors, create/revoke passes) and user context.

## Tech Choices
- **Vite + TypeScript** for fast iteration and type safety.
- **Frontier SDK** for wallet and partnership APIs.
- **Hand-rolled styling** with glassmorphism, gradients, and responsive layouts—no legacy UI kits.

## Features
- Sponsor switcher backed by `partnerships:listSponsors`.
- Active/revoked toggle with paginated pass listing.
- Inline revoke actions per pass.
- Creation modal with required fields and optional expiry, scoped to the selected sponsor.
- Loading skeletons, error toasts, and mobile-friendly layout.

## Workflow & Notes
- Designed UI first to keep actions discoverable (hero, control panel, list, modal).
- State is tracked in a lightweight store in `src/main.ts`; render cycles re-bind events for clarity.
- Development port set to **5437** to align with the Frontier sandbox expectations.
