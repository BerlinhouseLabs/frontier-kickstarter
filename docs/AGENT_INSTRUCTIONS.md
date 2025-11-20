# Agent Instructions for Frontier Tower App Development

## Overview

This document provides comprehensive instructions for LLM agents developing apps for the Frontier Tower platform. Frontier Tower is a Web3 wallet PWA that supports third-party apps through a secure iframe-based SDK architecture.

### App Architecture
- Apps run in sandboxed iframes with restricted permissions
- Communication via postMessage API through the AppHostSDK
- Apps request permissions upfront (declared in registry)
- Apps are cached in memory for fast switching

## SDK Communication Protocol

### Message Format

Apps communicate with the host via postMessage:

```typescript
// Request from app to host
interface SDKRequest {
  type: string;           // Format: "category:method" (e.g., "wallet:getBalance")
  requestId: string;      // Unique ID for matching responses
  payload?: any;          // Optional data for the request
}

// Response from host to app
interface SDKResponse {
  type: 'response' | 'error';
  requestId: string;      // Matches the request ID
  result?: any;           // Result data (if type === 'response')
  error?: string;         // Error message (if type === 'error')
}
```

### Available SDK Methods

#### Storage Access (`storage:*`)

**storage:get**
```typescript
// Request
{ type: 'storage:get', requestId: '...', payload: { key: string } }
// Response
{ type: 'response', requestId: '...', result: any }
```

**storage:set**
```typescript
// Request
{ type: 'storage:set', requestId: '...', payload: { key: string, value: any } }
// Response
{ type: 'response', requestId: '...', result: void }
```

**storage:remove**
```typescript
// Request
{ type: 'storage:remove', requestId: '...', payload: { key: string } }
// Response
{ type: 'response', requestId: '...', result: void }
```

**storage:clear**
```typescript
// Request
{ type: 'storage:clear', requestId: '...', payload: null }
// Response
{ type: 'response', requestId: '...', result: void }
```

Storage is automatically scoped per app using prefix `app:{appId}:`.

#### Wallet Access (`wallet:*`)

**wallet:getBalance**
```typescript
// Request
{ type: 'wallet:getBalance', requestId: '...', payload: null }
// Response (bigint as string, normalized to 18 decimals)
{ type: 'response', requestId: '...', result: "1000000000000000000" }
```

**wallet:getBalanceFormatted**
```typescript
// Request
{ type: 'wallet:getBalanceFormatted', requestId: '...', payload: null }
// Response
{ type: 'response', requestId: '...', result: "$10.50" }
```

**wallet:getAddress**
```typescript
// Request
{ type: 'wallet:getAddress', requestId: '...', payload: null }
// Response
{ type: 'response', requestId: '...', result: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" }
```

**wallet:getSmartAccount**
```typescript
// Request
{ type: 'wallet:getSmartAccount', requestId: '...', payload: null }
// Response
{ 
  type: 'response', 
  requestId: '...', 
  result: {
    ownerAddress: string,
    contractAddress: string,
    network: string
  }
}
```

**wallet:transferERC20**
```typescript
// Request
{ 
  type: 'wallet:transferERC20', 
  requestId: '...', 
  payload: {
    tokenAddress: string,  // ERC20 token contract address
    to: string,            // Recipient address
    amount: string,        // Amount as bigint string
    overrides?: {          // Optional gas overrides
      callGasLimit?: string,
      verificationGasLimit?: string,
      preVerificationGas?: string,
      maxFeePerGas?: string,
      maxPriorityFeePerGas?: string
    }
  }
}
// Response (UserOperationReceipt)
{ type: 'response', requestId: '...', result: { ... } }
```

**wallet:approveERC20**
```typescript
// Request
{ 
  type: 'wallet:approveERC20', 
  requestId: '...', 
  payload: {
    tokenAddress: string,  // ERC20 token contract address
    spender: string,       // Spender address
    amount: string,        // Amount as bigint string
    overrides?: { ... }
  }
}
// Response
{ type: 'response', requestId: '...', result: { ... } }
```

**wallet:transferNative**
```typescript
// Request
{ 
  type: 'wallet:transferNative', 
  requestId: '...', 
  payload: {
    to: string,            // Recipient address
    amount: string,        // Amount as bigint string (in wei)
    overrides?: { ... }
  }
}
// Response
{ type: 'response', requestId: '...', result: { ... } }
```

**wallet:executeCall**
```typescript
// Request
{ 
  type: 'wallet:executeCall', 
  requestId: '...', 
  payload: {
    call: {
      target: string,      // Contract address
      value: string,       // ETH value as bigint string
      data: string         // Hex-encoded calldata
    },
    overrides?: { ... }
  }
}
// Response
{ type: 'response', requestId: '...', result: { ... } }
```

**wallet:transferFrontierDollar**
```typescript
// Request
{ 
  type: 'wallet:transferFrontierDollar', 
  requestId: '...', 
  payload: {
    to: string,            // Recipient address
    amount: string,        // Amount as decimal string (e.g., '10.5')
    overrides?: { ... }
  }
}
// Response
{ type: 'response', requestId: '...', result: { ... } }
```

#### Chain Access (`chain:*`)

**chain:getCurrentNetwork**
```typescript
// Request
{ type: 'chain:getCurrentNetwork', requestId: '...', payload: null }
// Response
{ type: 'response', requestId: '...', result: "base-sepolia" }
```

**chain:getAvailableNetworks**
```typescript
// Request
{ type: 'chain:getAvailableNetworks', requestId: '...', payload: null }
// Response
{ type: 'response', requestId: '...', result: ["base", "base-sepolia"] }
```

**chain:switchNetwork**
```typescript
// Request
{ type: 'chain:switchNetwork', requestId: '...', payload: { network: "base" } }
// Response
{ type: 'response', requestId: '...', result: void }
```

**chain:getCurrentChainConfig**
```typescript
// Request
{ type: 'chain:getCurrentChainConfig', requestId: '...', payload: null }
// Response
{ 
  type: 'response', 
  requestId: '...', 
  result: {
    id: number,
    name: string,
    network: string,
    nativeCurrency: { name: string, symbol: string, decimals: number },
    rpcUrl: string,
    blockExplorer: { name: string, url: string },
    stableCoins: Array<{
      name: string,
      symbol: string,
      decimals: number,
      address: string,
      underlying: "USD"
    }>,
    testnet: boolean
  }
}
```

#### User Access (`user:*`)

**user:getDetails**
```typescript
// Request
{ type: 'user:getDetails', requestId: '...', payload: null }
// Response
{ 
  type: 'response', 
  requestId: '...', 
  result: {
    id: string,
    email: string,
    firstName?: string,
    lastName?: string,
    username?: string
  }
}
```

**user:getProfile**
```typescript
// Request (no payload needed - returns current user's profile)
{ type: 'user:getProfile', requestId: '...', payload: null }
// Response
{ 
  type: 'response', 
  requestId: '...', 
  result: {
    id: number,
    user: number,
    firstName: string,
    lastName: string,
    nickname: string,
    profilePicture: string,
    phoneNumber: string,
    community: string,
    communityName: string,
    organization: string,
    organizationRole: string,
    socialSite: string,
    socialHandle: string,
    githubHandle: string,
    currentWork: string,
    notableWork: string,
    receiveUpdates: boolean,
    notificationCommunityEvent: boolean,
    notificationTowerEvent: boolean,
    notificationUpcomingEvent: boolean,
    notificationTweetPicked: boolean,
    notifyEventInvites: boolean,
    optInSms: boolean,
    howDidYouHearAboutUs: string,
    braggingStatement: string,
    contributionStatement: string,
    hasUsablePassword: string
  }
}
```

**user:getReferralOverview**
```typescript
// Request
{ type: 'user:getReferralOverview', requestId: '...', payload: null }
// Response
{ 
  type: 'response', 
  requestId: '...', 
  result: {
    totalReferrals: number,
    activeReferrals: number,
    totalRewards: number
  }
}
```

**user:getReferralDetails**
```typescript
// Request (optional page parameter for pagination)
{ type: 'user:getReferralDetails', requestId: '...', payload: 1 }
// Response (paginated)
{ 
  type: 'response', 
  requestId: '...', 
  result: {
    count: number,
    results: Array<{
      id: string,
      email: string,
      status: string,
      createdAt: string,
      reward?: number
    }>
  }
}
```

**user:addUserContact**
```typescript
// Request
{ 
  type: 'user:addUserContact', 
  requestId: '...', 
  payload: {
    email?: string,
    phoneNumber?: string,
    // ... additional contact fields
  }
}
// Response
{ type: 'response', requestId: '...', result: void }
```

## App Registration

Apps must be registered in the host's `AppRegistry` before they can be installed:

```typescript
// In src/lib/apps/registry.ts
const APP_REGISTRY: AppMetadata[] = [
  {
    id: 'your-app-id',              // Unique identifier
    url: 'https://your-app.com',    // App URL (must match origin for security)
    developer: {
      name: 'Developer Name',
      url: 'https://developer.com',
      description: 'Developer description'
    },
    permissions: [
      'wallet:*',      // Wildcard for all wallet methods
      'storage:*',     // Wildcard for all storage methods
      'user:*',        // Wildcard for all user methods
      'chain:*',       // Wildcard for all chain methods
      // Or specific permissions:
      // 'wallet:getBalance',
      // 'storage:get',
      // 'storage:set'
    ],
    permissionDisclaimer: 'Description of what permissions are used for',
  }
];
```

### Permission System

- Permissions use format `category:method` (e.g., `wallet:getBalance`)
- Wildcard `category:*` grants all methods in that category
- Apps can only call methods they have permission for
- Permission checks happen on every SDK request

## UI Utilities

### Detection Utilities

The SDK provides utilities to detect if your app is running inside Frontier Wallet:

```typescript
import { isInFrontierApp, getParentOrigin } from '@frontiertower/frontier-sdk';

// Check if running in Frontier Wallet iframe
if (isInFrontierApp()) {
  // Initialize SDK and app
  const sdk = new FrontierSDK();
} else {
  // Show standalone message
  renderStandaloneMessage(document.body, 'My App Name');
}

// Get parent wallet origin
const origin = getParentOrigin();
```

### Standalone Message

Display a user-friendly message when the app is accessed outside Frontier Wallet:

```typescript
import { renderStandaloneMessage, createStandaloneHTML } from '@frontiertower/frontier-sdk';

// Render into a container element
renderStandaloneMessage(document.getElementById('app'), 'My App Name');

// Or get HTML string
const html = createStandaloneHTML('My App Name');
```

## App Development Guidelines

### 1. HTML Structure

Apps should include standard meta tags for the host to extract:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your App Name</title>
  <meta name="description" content="App description">
  <link rel="icon" href="/favicon.ico">
</head>
<body>
  <!-- Your app content -->
</body>
</html>
```

### 2. SDK Client Implementation

**IMPORTANT: The SDK is already installed in this project as `@frontiertower/frontier-sdk`. DO NOT implement your own SDK client. Simply import and use it.**

```typescript
import { FrontierSDK } from '@frontiertower/frontier-sdk';

const sdk = new FrontierSDK();

// Access different modules
const wallet = sdk.getWallet();
const storage = sdk.getStorage();
const chain = sdk.getChain();
const user = sdk.getUser();

// Example usage
const balance = await wallet.getBalance();
const userDetails = await user.getDetails();
```

**For reference only - if you need to understand the implementation:**

```typescript
class FrontierSDK {
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>();

  constructor() {
    window.addEventListener('message', this.handleMessage);
  }

  private handleMessage = (event: MessageEvent) => {
    const response = event.data as SDKResponse;
    const pending = this.pendingRequests.get(response.requestId);
    
    if (!pending) return;
    
    if (response.type === 'error') {
      pending.reject(new Error(response.error));
    } else {
      pending.resolve(response.result);
    }
    
    this.pendingRequests.delete(response.requestId);
  };

  private request<T>(type: string, payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      
      this.pendingRequests.set(requestId, { resolve, reject });
      
      window.parent.postMessage({
        type,
        requestId,
        payload
      }, '*');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // Storage methods
  async storageGet(key: string): Promise<any> {
    return this.request('storage:get', { key });
  }

  async storageSet(key: string, value: any): Promise<void> {
    return this.request('storage:set', { key, value });
  }

  async storageRemove(key: string): Promise<void> {
    return this.request('storage:remove', { key });
  }

  async storageClear(): Promise<void> {
    return this.request('storage:clear');
  }

  // Wallet methods
  async walletGetBalance(): Promise<bigint> {
    const result = await this.request<string>('wallet:getBalance');
    return BigInt(result);
  }

  async walletGetBalanceFormatted(): Promise<string> {
    return this.request('wallet:getBalanceFormatted');
  }

  async walletGetAddress(): Promise<string> {
    return this.request('wallet:getAddress');
  }

  async walletTransferERC20(params: {
    tokenAddress: string;
    to: string;
    amount: bigint;
    overrides?: any;
  }): Promise<any> {
    return this.request('wallet:transferERC20', {
      ...params,
      amount: params.amount.toString()
    });
  }

  // Chain methods
  async chainGetCurrentNetwork(): Promise<string> {
    return this.request('chain:getCurrentNetwork');
  }

  async chainSwitchNetwork(network: string): Promise<void> {
    return this.request('chain:switchNetwork', { network });
  }

  // User methods
  async userGetDetails(): Promise<any> {
    return this.request('user:getDetails');
  }
}

// Export singleton instance
export const sdk = new FrontierSDK();
```

### 3. Security Considerations

- **Origin Verification**: The host verifies that postMessage events come from the registered app URL
- **Sandboxed Iframe**: Apps run with `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`
- **Permission Checks**: Every SDK request is checked against declared permissions
- **Scoped Storage**: Each app has isolated storage (automatic prefix)
- **No Direct DOM Access**: Apps cannot access the host's DOM or other apps

### 4. Best Practices

#### Error Handling
```typescript
try {
  const balance = await sdk.walletGetBalance();
  console.log('Balance:', balance);
} catch (error) {
  if (error.message.includes('Permission denied')) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

#### Working with BigInt
```typescript
// Always convert bigint to string for JSON serialization
const amount = BigInt('1000000000000000000'); // 1 token with 18 decimals
await sdk.walletTransferERC20({
  tokenAddress: '0x...',
  to: '0x...',
  amount: amount  // SDK client converts to string
});

// Parse bigint from responses
const balance = await sdk.walletGetBalance(); // Returns bigint
const balanceInTokens = Number(balance) / 1e18;
```

#### Responsive Design
```css
/* Apps should be responsive and work in iframe */
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
}
```

#### Loading States
```typescript
// Show loading state while waiting for SDK responses
async function loadData() {
  setLoading(true);
  try {
    const [balance, address] = await Promise.all([
      sdk.walletGetBalance(),
      sdk.walletGetAddress()
    ]);
    // Update UI
  } finally {
    setLoading(false);
  }
}
```

### 5. Development Setup

#### Local Development
```bash
# Run your app on a local server
npm run dev  # e.g., http://localhost:5174
```

#### Testing with Host
1. Run this package on localhost:5174
2. Install the app through the host UI or programmatically
3. Navigate to `/apps/my-app` in the host

#### Production Deployment
1. Deploy your app to a public URL (e.g., Vercel, Netlify)
2. Update the registry with the production URL
3. Ensure CORS is configured if needed
4. Test thoroughly with production permissions

## Technical Details

### Smart Account Architecture
- **Standard**: ERC-4337 Account Abstraction
- **Paymaster**: Frontiertower will sponsor transactions based on membership
- **Delegate System**: Multi-signature support with weighted delegates allows community based account recovery on lost private keys
- **Networks**: Base (mainnet), Base Sepolia (testnet)

### Chain Configuration
```typescript
interface ChainConfig {
  id: number;                    // Chain ID (e.g., 8453 for Base)
  name: string;                  // Human-readable name
  network: string;               // Network identifier
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;                // RPC endpoint
  blockExplorer: {
    name: string;
    url: string;
  };
  stableCoins: StableCoin[];     // Supported stablecoins
  testnet: boolean;
}
```

### App Lifecycle

1. **Registration**: App added to `AppRegistry`
2. **Installation**: User installs app (stored in IndexedDB)
3. **Loading**: Iframe created and cached in `AppManager`
4. **Communication**: SDK messages via postMessage
5. **Caching**: Iframe kept alive for fast switching
6. **Uninstallation**: Iframe destroyed, storage cleared

### App Manager
- Manages iframe lifecycle
- Caches iframes in memory for performance
- Tracks last opened app for auto-resume
- Handles show/hide without destroying iframes

## Example App Structure

```
my-app/
├── index.html           # Entry point with meta tags
├── src/
│   ├── sdk.ts          # Frontier SDK client
│   ├── main.ts         # App initialization
│   └── components/     # Your app components
├── package.json
└── vite.config.ts      # Or your build config
```

## Common Patterns

### Initialize and Load Data
```typescript
import { FrontierSDK, isInFrontierApp, renderStandaloneMessage } from '@frontiertower/frontier-sdk';

// Check if running in Frontier Wallet
if (!isInFrontierApp()) {
  renderStandaloneMessage(document.body, 'My App');
  throw new Error('App must run in Frontier Wallet');
}

const sdk = new FrontierSDK();

async function init() {
  try {
    // Load user and wallet data using access classes
    const [user, balance, network] = await Promise.all([
      sdk.getUser().getDetails(),
      sdk.getWallet().getBalanceFormatted(),
      sdk.getChain().getCurrentNetwork()
    ]);
    
    // Update UI
    updateUI({ user, balance, network });
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

init();
```

### Persist State
```typescript
const storage = sdk.getStorage();

// Save state
await storage.set('user-preferences', {
  theme: 'dark',
  notifications: true
});

// Load state
const preferences = await storage.get('user-preferences');
```

### Handle Transactions
```typescript
const wallet = sdk.getWallet();

// Send Frontier Dollars (easiest method)
async function sendFrontierDollars(to: string, amount: string) {
  try {
    setLoading(true);
    const receipt = await wallet.transferFrontierDollar(to, amount);
    showSuccess('Payment sent!');
    return receipt;
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

// Send native currency (ETH)
async function sendNative(to: string, amount: bigint) {
  try {
    setLoading(true);
    const receipt = await wallet.transferNative(to, amount);
    showSuccess('Payment sent!');
    return receipt;
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

// Send ERC20 tokens
async function sendERC20(tokenAddress: string, to: string, amount: bigint) {
  try {
    setLoading(true);
    const receipt = await wallet.transferERC20(tokenAddress, to, amount);
    showSuccess('Tokens sent!');
    return receipt;
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}
```

## Troubleshooting

### Permission Denied Errors
- Check that your app is registered with the required permissions
- Verify the permission format matches `category:method`
- Use wildcard `category:*` for all methods in a category

### Origin Mismatch
- Ensure the app URL in the registry matches your actual origin
- Check that you're not mixing http/https or localhost/127.0.0.1

### Request Timeout
- SDK requests timeout after 30 seconds
- Check that the host is responding
- Verify your app is loaded in the correct iframe context

### BigInt Serialization
- Always convert BigInt to string before sending in payload
- Parse string back to BigInt when receiving

## Resources

- **Host Repository**: `/Users/christianpeters/frontiertower/pwa`
- **SDK Types**: `src/lib/apps/sdk/types.ts`
- **Registry**: `src/lib/apps/registry.ts`
- **Example App**: Check the `kickstarter` app in the registry

## Support

For questions or issues:
1. Check this documentation
2. Review the SDK implementation in `src/lib/apps/sdk/`
3. Test with the example app configuration
4. Contact the Frontier Tower development team
