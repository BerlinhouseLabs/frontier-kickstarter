# Frontier Kickstarter App

A minimal demo app for the Frontier App Store showing how to interact with the Frontier Wallet.

## ⚠️ Disclaimer

**If you are using this, you are in the ultra-early developer group. There will be dragons, things will break.**

## Getting Started

### Prerequisites

- Request a test user via the tech team (no automation for this yet)
- This app is preconfigured to be tested on `sandbox.wallet.frontiertower.io`
- If you want to use webhooks to react to things happening in the network society checkkout `./docs/WEBHOOKS.md`


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

## Frontier SDK

The `src/frontier/` folder contains the SDK that apps use to communicate with the host PWA.

**To use in your own app:**
1. Copy the entire `src/frontier/` folder to your project
2. Import and initialize: `const sdk = new FrontierSDK()`
3. Use SDK methods:
   - `sdk.getBalance()` - Get wallet balance
   - `sdk.getAddress()` - Get wallet address
   - `sdk.getData(key)` - Get stored data
   - `sdk.setData(key, value)` - Store data

See the SDK documentation for a complete list of available permissions.

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
