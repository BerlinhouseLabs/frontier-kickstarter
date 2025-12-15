# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

# Frontier Kickstarter App

This repository contains a demo application for the **Frontier App Store**. It is a minimal TypeScript/Vite application designed to run within the **Frontier Wallet PWA** using an iframe-based architecture.

## Architecture

*   **Type**: Client-side Single Page Application (SPA).
*   **Framework**: Vanilla TypeScript with Vite.
*   **Integration**: Runs inside an iframe within the Frontier Wallet PWA.
*   **Communication**: Uses `@frontiertower/frontier-sdk` to communicate with the host wallet via `postMessage`.
*   **Permissions**: The app operates in a sandboxed environment and must request permissions (e.g., `wallet:getBalance`, `storage:set`) which are enforced by the host.

## Development Workflow

### Prerequisites
*   Node.js & npm
*   Access to the Frontier Wallet Sandbox: `https://sandbox.wallet.frontiertower.io`

### Setup & Run
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start local server**:
    ```bash
    npm run dev
    ```
    This typically starts the app at `http://localhost:5174`.

### Testing
*   **Standalone**: Opening `http://localhost:5174` directly will show a "Standalone" warning message because the app detects it is not inside the Frontier Wallet.
*   **Integrated Testing**:
    1.  Go to [sandbox.wallet.frontiertower.io](https://sandbox.wallet.frontiertower.io).
    2.  Navigate to **Apps** -> **App Store**.
    3.  Install the **Kickstarter App** (or the specific app being developed if registered).
    4.  Open the app to test SDK integration (Wallet, Storage, User, Chain interactions).

## Code Structure

*   `src/main.ts`: Main entry point. Initializes the `FrontierSDK`, handles UI rendering, and manages event listeners.
*   `src/style.css`: Global styles.
*   `docs/AGENT_INSTRUCTIONS.md`: **CRITICAL**. Contains the complete API reference for the Frontier SDK, including method signatures and message formats. Refer to this file when implementing new SDK features.

## Coding Guidelines

### SDK Usage
*   **Always** check context first:
    ```typescript
    import { isInFrontierApp, renderStandaloneMessage } from '@frontiertower/frontier-sdk';
    
    if (!isInFrontierApp()) {
        renderStandaloneMessage(document.body, 'App Name');
        return;
    }
    ```
*   **Singleton Pattern**: Instantiate `FrontierSDK` once or use the helper modules.
    ```typescript
    import { FrontierSDK } from '@frontiertower/frontier-sdk';
    const sdk = new FrontierSDK();
    // Access modules: sdk.getWallet(), sdk.getStorage(), etc.
    ```
*   **BigInt Handling**: The SDK requires `BigInt` values to be serialized as strings when passed in payloads.
    ```typescript
    // Correct
    await sdk.getWallet().transferERC20({ 
        ..., 
        amount: "1000000000000000000" 
    });
    ```

### Error Handling
*   Wrap SDK calls in `try/catch` blocks.
*   Handle specific errors like **Permission denied** or **timeouts** (30s default).

### UI/UX
*   **Responsive**: The app runs in a mobile-sized iframe (typically). Ensure CSS is responsive (`width: 100vw`, `height: 100vh`).
*   **Loading States**: Always show loading indicators during async SDK calls (`await sdk...`).

## Deployment
*   Apps are self-hosted by the developer (e.g., Vercel, Netlify).
*   Deployment involves providing metadata (name, URL, permissions) to the Frontier team to update the `AppRegistry`.
*   See `docs/DEPLOYMENT.md` for details.
