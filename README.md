# Sponsor Pass Manager

A modern web application for managing sponsor passes on the Frontier OS App Store. Built as a technical assessment demonstrating clean architecture, modern tooling, and polished UI.

## Running the App

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5174` and is designed to be loaded inside the Frontier Wallet at `sandbox.wallet.frontiertower.io`.

### Testing

```bash
npm test          # Run tests once
npm run test:watch # Watch mode
```

## Tech Stack Choices

| Technology | Version | Rationale |
|------------|---------|-----------|
| **React** | 19.x | Latest stable with improved hooks and concurrent features |
| **Tailwind CSS** | 4.x | CSS-first configuration, native cascade layers, faster builds |
| **Headless UI** | 2.x | Accessible, unstyled primitives (Listbox, Dialog) that integrate with Tailwind |
| **Motion** | 12.x | Declarative animations with layout animations and exit transitions |
| **React Hook Form** | 7.x | Minimal re-renders, native validation, excellent TypeScript support |
| **Zod** | 4.x | Schema-first validation with type inference |
| **Vitest** | 3.x | Vite-native testing, fast HMR, ESM-first |
| **TypeScript** | 5.x | Strict type safety throughout |

### Architecture

```
src/
├── main.tsx              # Entry point, SDK initialization
├── App.tsx               # Root component with context provider
├── context/              # React Context for global state
├── components/           # UI components (Dashboard, PassCard, modals)
├── hooks/                # Custom hooks (useSponsors, usePasses, usePassActions)
├── forms/                # Zod schemas for validation
└── types/                # TypeScript interfaces
```

**Key decisions:**
- **Context over Redux** - App state is simple (selected sponsor), no need for additional dependencides and complexity.
- **Custom hooks** - Encapsulate SDK calls and state management
- **Headless UI** - Accessible dropdowns/modals without fighting pre-built styles
- **Motion for animations** - Smooth page transitions and micro-interactions

## Workflow

1. **Research** - Explored the SDK documentation, project structure and AGENT_INSTRUCTIONS.md to map out the API surface and data models
2. **Architecture** - Handpicked cutting edge tech-stack, designed the component hierarchy and structure to encapsulate SDK interactions cleanly.
3. **Core features** - Built the sponsor selector first to establish data flow, then layered on pass listing with pagination
4. **CRUD operations** - Implemented create/revoke flows with form validation (Zod + React Hook Form) and optimistic UI updates
5. **Polish** - Designed the glassmorphism/ios-like neoskuemorphism aesthetic, added Motion animations for transitions, and ensured mobile responsiveness
6. **Quality** - Wrote unit tests for critical paths: form validation, component behavior, and hook logic

## Features

- **Sponsor Selection** - Switch between managed sponsors via dropdown
- **Pass Management** - View paginated list of sponsor passes with status filtering
- **Create Pass** - Modal form with validation for new passes
- **Revoke Pass** - Confirmation dialog for immediate revocation
- **Responsive Cutting-edge UI** - Works across desktop and mobile viewports. Hope you like it :)

