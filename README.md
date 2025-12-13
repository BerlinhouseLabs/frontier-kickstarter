# Frontier Kickstarter App

A minimal demo app for the Frontier App Store showing how to interact with the Frontier Wallet.

## ⚠️ Disclaimer

**If you are using this, you are in the ultra-early developer group. There will be dragons, things will break.**

## Getting Started

### Prerequisites

- Request a test user via the tech team (no automation for this yet)
- This app is preconfigured to be tested on `sandbox.wallet.frontiertower.io`


### Agent Context 

Find the agent instructions and deployment guide to feed to your agent here:

```
./docs/AGENT_INSTRUCTIONS.md
./docs/DEPLOYMENT.md
```

### Development Setup

```bash
npm install
npm run dev
```

### Installing the PWA

> If you are developing we recommend using Chrome and move to test the local apps before release.

The Frontier Wallet is a Progressive Web App (PWA) that can be installed on your device:

**iOS:**
1. Open Safari and navigate to [sandbox.wallet.frontiertower.io](https://sandbox.wallet.frontiertower.io)
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

**Android:**
1. Open Chrome and navigate to [sandbox.wallet.frontiertower.io](https://sandbox.wallet.frontiertower.io)
2. Tap the three-dot menu in the top right
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Add" or "Install" to confirm

### Testing Your App

1. Click on **Apps** → **App Store**
2. Install the **Kickstarter App**
3. Click the app to load your dev environment with all permissions
4. The kickstarter app demonstrates basic functionality for interacting with the Frontier Wallet

## Features Overview

This application demonstrates the core capabilities of the Frontier App Store SDK:

### Wallet Access
- Get raw and formatted balances
- Retrieve wallet address and smart account details (ERC-4337)
- Transfers: ERC20 tokens, native currency (ETH), Frontier Dollar
- Execute arbitrary contract calls and approve ERC20 allowances

### Persistent Storage
- Per-app isolated storage (automatic scoping)
- Get, set, remove, and clear keys

### Network/Chain Access
- Get current network and list available networks
- Switch networks programmatically
- Fetch full chain configuration (RPC, explorer, stablecoins)

### User Data Access
- Basic details (ID, email, names)
- Extended profile data
- Referral overview and paginated referral details
- Add user contact info

### UI Utilities
- Detect Frontier Wallet context and show graceful standalone message when outside

### Security Features
- Sandboxed iframe isolation and strict origin verification
- Per-app permission declarations validated on every request
- Scoped storage, no cross-app/host DOM access

### Demo App Functionality
- Greeting with wallet address and balance
- Persistent counter using storage
- "Send $1 Frontier Dollar" action with real-time balance refresh
- Loading and error handling states

## Frontier SDK

This app uses the `@frontiertower/frontier-sdk` package to communicate with the host PWA via postMessage.

Key characteristics:
- Promise-based API with request/response matching via UUID
- 30-second request timeout and consistent error handling
- Permission-checked methods grouped by modules: wallet, storage, chain, user

Quick start example:
```typescript
import { FrontierSDK } from '@frontiertower/frontier-sdk';

const sdk = new FrontierSDK();
const wallet = sdk.getWallet();
const storage = sdk.getStorage();
const chain = sdk.getChain();
const user = sdk.getUser();

const balance = await wallet.getBalanceFormatted();
const details = await user.getDetails();
await storage.set('counter', 1);
const network = await chain.getCurrentNetwork();
```

Permission system:
- Format: `category:method` (e.g., `wallet:getBalance`)
- Wildcard: `category:*` (e.g., `wallet:*`)
- Declared in registry and enforced at runtime

See `docs/AGENT_INSTRUCTIONS.md` for the full SDK surface and message formats.

## Deploying Your App

When you're ready to deploy, contact the dev team (we will automate this process later).

### Required Information

Provide the following metadata:

```javascript
{
  developer: {
    name: 'Frontier Tower',
    url: 'https://frontiertower.io',
    description: 'Building the future of decentralized applications',
  },
  permissionDisclaimer: 'Here we tell what permissions the app is requesting and why'
  permissions: ["wallet:getAddress", "storage:*"]
}
```

- Specify the list of permissions your app needs (see SDK documentation)
- **Use as few permissions as possible**
- Explain why you need each permission in the `permissionDisclaimer`

### Hosting & Publishing

- You host your app yourself
- We will publish it under `your-app.appstore.frontiertower.io`
- Your app will be published in the next alpha version and make its way to public release

## App Metadata

Apps use standard HTML meta tags for metadata (fetched by the host PWA):

```html
<head>
  <title>Your App Name</title>
  <meta name="description" content="What your app does" />
  <link rel="icon" href="/favicon.ico" />
</head>
```

The host PWA parses your HTML to display the app in the store.
