# Product Requirements Document: Frontier Kickstarter App

## 1. Introduction
The **Frontier Kickstarter App** is a reference application designed to demonstrate the capabilities of the **Frontier App Store SDK**. It serves as a "Hello World" example for developers building third-party applications ("Miniapps") that run within the Frontier Wallet ecosystem.

## 2. Goals & Objectives
*   **Demonstrate SDK Capabilities**: Showcase key SDK modules including Wallet, User, Storage, and Chain interactions.
*   **Developer Education**: Provide clean, documented code that developers can copy/paste or fork to start their own projects.
*   **Platform Validation**: Verify that the Frontier Wallet host environment correctly handles iframe permissions, storage isolation, and transaction requests.

## 3. Functional Requirements

### 3.1 Environment & Context
*   **FR-01**: The app must detect whether it is running inside the Frontier Wallet (iframe) or in a standalone browser.
*   **FR-02**: If running standalone, the app must display a "Standalone" warning message guiding the user to open it within the Frontier Wallet.
*   **FR-03**: The app must support execution in a sandboxed iframe environment with `allow-scripts`, `allow-same-origin`, `allow-forms`, and `allow-popups`.

### 3.2 User Identity
*   **FR-04**: The app must fetch the current user's profile details using `sdk.getUser().getDetails()`.
*   **FR-05**: The app must display a personalized greeting using the user's First Name or Username (defaulting to "Citizen" if unavailable).

### 3.3 Wallet Integration
*   **FR-06**: The app must retrieve and display the connected wallet's public address (masked/truncated).
*   **FR-07**: The app must retrieve and display the wallet's current balance formatted in USD (or relevant currency).
*   **FR-08**: The app must auto-refresh the balance after a successful transaction.

### 3.4 Transactions
*   **FR-09**: The app must provide a "Send $1 to chp!" button to demonstrate payment functionality.
*   **FR-10**: The button must be disabled if the user has insufficient balance (Balance <= 0).
*   **FR-11**: Clicking the button must trigger `sdk.getWallet().transferFrontierDollar()`.
*   **FR-12**: The app must display real-time status updates: "Sending...", "Success! Tx: [Hash]", or "Error: [Message]".

### 3.5 Persistent Storage
*   **FR-13**: The app must demonstrate isolated storage using `sdk.getStorage()`.
*   **FR-14**: The app must display a counter value that persists across sessions.
*   **FR-15**: The app must provide an "Increment Counter" button that updates the stored value immediately.

## 4. Non-Functional Requirements

### 4.1 UI/UX
*   **NFR-01**: The interface must be fully responsive, designed primarily for mobile viewports (`width: 100vw`, `height: 100vh`).
*   **NFR-02**: The app must show visual loading indicators while fetching initial data from the SDK.
*   **NFR-03**: Error messages must be user-friendly and displayed within the UI, not just the console.

### 4.2 Security
*   **NFR-04**: The app must request specific permissions (`wallet:getBalance`, `storage:set`, etc.) which are enforced by the host.
*   **NFR-05**: The app must not attempt to access the host DOM directly (violating sandbox rules).
*   **NFR-06**: `BigInt` values must be serialized to strings for all SDK communication to prevent JSON parsing errors.

### 4.3 Performance
*   **NFR-07**: Initial load time inside the iframe should be under 1 second (excluding network latency for SDK data).
*   **NFR-08**: SDK requests must timeout gracefully after 30 seconds if the host does not respond.

## 5. Deployment Requirements
*   **DR-01**: The app must serve valid CORS headers allowing access from Frontier Wallet domains (e.g., `*.wallet.frontiertower.io`).
*   **DR-02**: The app must provide metadata (Title, Description, Icon) via HTML meta tags for the App Store listing.
