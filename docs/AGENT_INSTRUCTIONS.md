# Agent Instructions for Frontier Tower App Development

## Overview

This document provides instructions for LLM agents developing apps for the Frontier Tower platform.

### App Architecture

- Apps run in sandboxed iframes with restricted permissions.
- Communication is via `postMessage` using the Frontier SDK request/response protocol.
- Apps request permissions upfront (declared in registry).

## SDK Communication Protocol

### Message Format

Apps communicate with the host via `postMessage`.

```ts
// Request from app to host
export interface SDKRequest {
  type: string;      // Format: "category:method" (e.g., "wallet:getBalance")
  requestId: string; // Unique ID for matching responses
  payload?: any;     // Optional data for the request
}

// Response from host to app
export interface SDKResponse {
  type: 'response' | 'error';
  requestId: string; // Matches the request ID
  result?: any;      // Present when type === 'response'
  error?: string;    // Present when type === 'error'
}
```

### Notes

- The SDK uses structured cloning via `postMessage`. Types like `bigint` may be used in payloads/results.
- Requests time out after 30 seconds in the SDK.

## Using the SDK in Apps

### Imports

```ts
import { FrontierSDK } from '@frontiertower/frontier-sdk';
import {
  isInFrontierApp,
  getParentOrigin,
  renderStandaloneMessage,
  createStandaloneHTML,
} from '@frontiertower/frontier-sdk/ui-utils';
```

### Initialization

```ts
if (!isInFrontierApp()) {
  renderStandaloneMessage(document.body, 'My App');
  throw new Error('App must run inside Frontier Wallet');
}

const sdk = new FrontierSDK();
```

## Full SDK Surface Area (Access Classes)

The SDK is organized into access classes that call `sdk.request(...)` internally.

### Storage Access (`storage:*`)

Access via: `sdk.getStorage()`

- `storage:get`
  - Payload: `{ key: string }`
  - Result: `any`
- `storage:set`
  - Payload: `{ key: string; value: any }`
  - Result: `void`
- `storage:remove`
  - Payload: `{ key: string }`
  - Result: `void`
- `storage:clear`
  - Payload: `undefined`
  - Result: `void`

### Wallet Access (`wallet:*`)

Access via: `sdk.getWallet()`

#### Types

```ts
export interface SmartAccount {
  id: number;
  ownerAddress: string;
  contractAddress: string | null;
  network: string;
  status: string;
  deploymentTransactionHash: string;
  createdAt: string;
}

export interface WalletBalance {
  /** Total balance including both native and internal FND */
  total: bigint;
  /** Native Frontier Network Dollar balance (freely convertible to fiat) */
  fnd: bigint;
  /** Internal Frontier Network Dollar balance (for Network Society spending) */
  internalFnd: bigint;
}

export interface WalletBalanceFormatted {
  /** Total balance formatted with currency symbol */
  total: string;
  /** Native Frontier Network Dollar balance formatted with currency symbol */
  fnd: string;
  /** Internal Frontier Network Dollar balance formatted with currency symbol */
  internalFnd: string;
}

export interface GasOverrides {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasLimit?: bigint;
}

export interface ExecuteCall {
  /** Target contract address */
  target: string;
  /** Value to send (in wei) */
  value?: bigint;
  /** Calldata */
  data: string;
}

export interface UserOperationReceipt {
  userOpHash: string;
  transactionHash: string;
  blockNumber: bigint;
  success: boolean;
}

export interface SwapQuote {
  sourceChain: object;
  targetChain: object;
  sourceToken: object;
  targetToken: object;
  expectedAmountOut: string;
  minAmountOut: string;
}

export enum SwapResultStatus {
  COMPLETED = 'COMPLETED',
  SUBMITTED = 'SUBMITTED',
}

export interface SwapResult {
  sourceChain: object;
  targetChain: object;
  sourceToken: object;
  targetToken: object;
  status: SwapResultStatus;
}

export interface UsdDepositInstructions {
  currency: 'usd';
  bankName: string;
  bankAddress: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankBeneficiaryName: string;
  paymentRail: string;
}

export interface EurDepositInstructions {
  currency: 'eur';
  iban: string;
  bic: string;
  bankName: string;
  beneficiaryName: string;
}

export interface OnRampResponse<T = UsdDepositInstructions | EurDepositInstructions> {
  currency: 'usd' | 'eur';
  depositInstructions: T;
  destinationAddress: string;
  destinationNetwork: string;
}

export interface LinkedBank {
  id: string;
  bankName: string;
  last4: string;
  withdrawalAddress: string;
  network: string;
}

export interface LinkedBanksResponse {
  banks: LinkedBank[];
}

export interface LinkBankResponse {
  externalAccountId: string;
  bankName: string;
  withdrawalAddress: string;
  network: string;
}

export interface BillingAddress {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type AccountOwnerType = 'individual' | 'business';

export interface DeprecatedSmartAccount {
  /** Unique identifier */
  id: number;
  /** Original EOA that controlled the smart account */
  ownerAddress: string;
  /** Deployed smart account contract address */
  contractAddress: string;
  /** Network identifier (e.g., 'base', 'base_sepolia') */
  network: string;
  /** When the account was deprecated */
  deprecatedAt: string;
  /** Smart account version at deployment */
  version: number;
}
```

#### Methods

- `wallet:getBalance`
  - Payload: `undefined`
  - Result: `WalletBalance`
- `wallet:getBalanceFormatted`
  - Payload: `undefined`
  - Result: `WalletBalanceFormatted`
- `wallet:getAddress`
  - Payload: `undefined`
  - Result: `string`
- `wallet:getSmartAccount`
  - Payload: `undefined`
  - Result: `SmartAccount`
- `wallet:transferERC20`
  - Payload: `{ tokenAddress: string; to: string; amount: bigint; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
- `wallet:approveERC20`
  - Payload: `{ tokenAddress: string; spender: string; amount: bigint; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
- `wallet:transferNative`
  - Payload: `{ to: string; amount: bigint; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
- `wallet:executeCall`
  - Payload: `{ call: ExecuteCall; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
- `wallet:transferFrontierDollar`
  - Payload: `{ to: string; amount: string; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
- `wallet:transferInternalFrontierDollar`
  - Payload: `{ to: string; amount: string; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
- `wallet:executeBatchCall`
  - Payload: `{ calls: ExecuteCall[]; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
- `wallet:getSupportedTokens`
  - Payload: `undefined`
  - Result: `string[]`
- `wallet:swap`
  - Payload: `{ sourceToken: string; targetToken: string; sourceNetwork: string; targetNetwork: string; amount: string }`
  - Result: `SwapResult`
- `wallet:quoteSwap`
  - Payload: `{ sourceToken: string; targetToken: string; sourceNetwork: string; targetNetwork: string; amount: string }`
  - Result: `SwapQuote`
- `wallet:transferOverallFrontierDollar`
  - Payload: `{ to: string; amount: string; overrides?: GasOverrides }`
  - Result: `UserOperationReceipt`
  - Note: Uses Internal FND first, then FND to complete the transfer
- `wallet:getUsdDepositInstructions`
  - Payload: `undefined`
  - Result: `OnRampResponse<UsdDepositInstructions>`
  - Note: Requires approved KYC
- `wallet:getEurDepositInstructions`
  - Payload: `undefined`
  - Result: `OnRampResponse<EurDepositInstructions>`
  - Note: Requires approved KYC
- `wallet:getLinkedBanks`
  - Payload: `undefined`
  - Result: `LinkedBanksResponse`
  - Note: Requires approved KYC
- `wallet:linkUsBankAccount`
  - Payload: `{ accountOwnerName: string; bankName: string; routingNumber: string; accountNumber: string; checkingOrSavings: 'checking' | 'savings'; address: BillingAddress }`
  - Result: `LinkBankResponse`
  - Note: Requires approved KYC
- `wallet:linkEuroAccount`
  - Payload: `{ accountOwnerName: string; accountOwnerType: AccountOwnerType; firstName: string; lastName: string; ibanAccountNumber: string; bic?: string }`
  - Result: `LinkBankResponse`
  - Note: Requires approved KYC
- `wallet:deleteLinkedBank`
  - Payload: `{ bankId: string }`
  - Result: `void`
- `wallet:getDeprecatedSmartAccounts`
  - Payload: `undefined`
  - Result: `DeprecatedSmartAccount[]`
  - Note: Returns deprecated smart accounts with active gas sponsorship
- `wallet:payWithFrontierDollar`
  - Payload: `{ to: string; amount: string; paymentId: string }`
  - Result: `UserOperationReceipt`
  - Note: Pay via PaymentRouter with payment reference UUID. Uses iFND first, then FND. Supports multi-token payments. paymentId must be a valid UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`).

### Chain Access (`chain:*`)

Access via: `sdk.getChain()`

#### Types

```ts
export enum Underlying {
  USD = "USD",
}

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

export interface StableCoin extends Token {
  underlying: Underlying;
}

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  bridgeSwapRouterFactoryAddress: string;
  uniswapV3FactoryAddress: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorer: { name: string; url: string };
  stableCoins: StableCoin[];
  supportedTokens: Token[];
  testnet: boolean;
}
```

#### Methods

- `chain:getCurrentNetwork`
  - Payload: `undefined`
  - Result: `string`
- `chain:getAvailableNetworks`
  - Payload: `undefined`
  - Result: `string[]`
- `chain:switchNetwork`
  - Payload: `{ network: string }`
  - Result: `void`
- `chain:getCurrentChainConfig`
  - Payload: `undefined`
  - Result: `ChainConfig`
- `chain:getContractAddresses`
  - Payload: `undefined`
  - Result: `{ fnd: string; iFnd: string | null; paymentRouter: string }`
  - Note: Returns token addresses (FND, iFND) and PaymentRouter contract address. iFND may be null if not configured.

### User Access (`user:*`)

Access via: `sdk.getUser()`

#### Types

```ts
export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  dateJoined: string;
  isStaff: boolean;
  isSuperuser: boolean;
}

export interface UserProfile {
  id: number;
  user: number;
  firstName: string;
  lastName: string;
  nickname: string;
  profilePicture: string;
  phoneNumber: string;
  community: string;
  communityName: string;
  organization: string;
  organizationRole: string;
  socialSite: string;
  socialHandle: string;
  githubHandle: string;
  currentWork: string;
  notableWork: string;
  receiveUpdates: boolean;
  notificationCommunityEvent: boolean;
  notificationTowerEvent: boolean;
  notificationUpcomingEvent: boolean;
  notificationTweetPicked: boolean;
  notifyEventInvites: boolean;
  optInSms: boolean;
  howDidYouHearAboutUs: string;
  braggingStatement: string;
  contributionStatement: string;
  hasUsablePassword: string;
}

export interface ReferralOverview {
  referralCount: number;
  ranking: number;
  referralLink: string;
  referralCode: string;
  referredBy: string | null;
}

export interface ReferralDetails {
  name: string;
  email: string;
  referralDate: string;
  reward: string;
  status: string;
}

export interface UserContact {
  email: string;
  phone: string;
  name: string;
}

export interface UserContactPayload {
  contacts: UserContact[];
}

export type KycStatus = 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';

export type TosStatus = 'pending' | 'approved';

export interface KycStatusResponse {
  status: KycStatus;
  isApproved: boolean;
  rejectionReason: string | null;
  kycLinkId: string | null;
  kycLinkUrl: string | null;
  tosStatus: TosStatus | null;
  tosLink: string | null;
}
```

#### Methods

- `user:getDetails`
  - Payload: `undefined`
  - Result: `User`
- `user:getProfile`
  - Payload: `undefined`
  - Result: `UserProfile`
- `user:getReferralOverview`
  - Payload: `undefined`
  - Result: `ReferralOverview`
- `user:getReferralDetails`
  - Payload: `number | undefined` (page number)
  - Result: `PaginatedResponse<ReferralDetails>`
- `user:addUserContact`
  - Payload: `UserContactPayload`
  - Result: `void`
- `user:getOrCreateKyc`
  - Payload: `string | undefined` (optional redirect URI)
  - Result: `KycStatusResponse`
  - Note: Returns KYC status; if not started, initiates KYC and returns verification URL

### Partnerships Access (`partnerships:*`)

Access via: `sdk.getPartnerships()`

#### Types

```ts
export interface Sponsor {
  id: number;
  name: string;
  dailyRate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type SponsorPassStatus = 'active' | 'revoked';

export interface SponsorPass {
  id: number;
  sponsor: number;
  sponsorName: string;
  firstName: string;
  lastName: string;
  email: string;
  status: SponsorPassStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
}

export interface CreateSponsorPassRequest {
  sponsor: number;
  firstName: string;
  lastName: string;
  email: string;
  expiresAt?: string;
}

export interface ListSponsorPassesParams {
  limit?: number;
  offset?: number;
}

export interface ListAllSponsorPassesParams extends ListSponsorPassesParams {
  includeRevoked?: boolean;
}

export interface ListSponsorsParams {
  limit?: number;
  offset?: number;
}
```

#### Methods

- `partnerships:listSponsors`
  - Payload: `ListSponsorsParams | undefined`
  - Result: `PaginatedResponse<Sponsor>`
- `partnerships:getSponsor`
  - Payload: `{ id: number }`
  - Result: `Sponsor`
- `partnerships:createSponsorPass`
  - Payload: `CreateSponsorPassRequest`
  - Result: `SponsorPass`
- `partnerships:listActiveSponsorPasses`
  - Payload: `ListSponsorPassesParams | undefined`
  - Result: `PaginatedResponse<SponsorPass>`
- `partnerships:listAllSponsorPasses`
  - Payload: `ListAllSponsorPassesParams | undefined`
  - Result: `PaginatedResponse<SponsorPass>`
- `partnerships:getSponsorPass`
  - Payload: `{ id: number }`
  - Result: `SponsorPass`
- `partnerships:revokeSponsorPass`
  - Payload: `{ id: number }`
  - Result: `void`

### Third-Party Access (`thirdParty:*`)

Access via: `sdk.getThirdParty()`

#### Types

```ts
export interface Developer {
  id: number;
  name: string;
  description: string;
  email: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDeveloperRequest {
  name?: string;
  description?: string;
  email?: string;
}

export interface RotateKeyResponse {
  message: string;
  developer: Developer;
}

export type AppStatus =
  | 'in_review'
  | 'accepted'
  | 'released'
  | 'rejected'
  | 'request_deactivation'
  | 'deactivated';

export type AppPermission = string;

export interface App {
  id: number;
  developer: number;
  icon: string | null;
  name: string;
  readableId: string;
  description: string;
  url: string;
  cnameEntry: string;
  txtEntry: string | null;
  permissions: AppPermission[];
  permissionDisclaimer: string;
  status: AppStatus;
  reviewNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppRequest {
  developer: number;
  url: string;
  cnameEntry: string;
  txtEntry?: string;
  permissions: AppPermission[];
  permissionDisclaimer: string;
}

export interface UpdateAppRequest {
  developer?: number;
  url?: string;
  cnameEntry?: string;
  txtEntry?: string;
  permissions?: AppPermission[];
  permissionDisclaimer?: string;
}

export type WebhookStatus = 'IN_REVIEW' | 'LIVE' | 'REJECTED';

export type WebhookEvent = string;

export type WebhookScope = Record<string, number[] | '*'>;

export interface WebhookConfig {
  events: WebhookEvent[];
  scope: WebhookScope;
}

export interface Webhook {
  id: number;
  developer: number;
  name: string;
  description: string;
  targetUrl: string;
  config: WebhookConfig;
  signingPublicKey: string;
  status: WebhookStatus;
  reviewNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookRequest {
  developer: number;
  name: string;
  description: string;
  targetUrl: string;
  config: WebhookConfig;
}

export interface UpdateWebhookRequest {
  developer?: number;
  name?: string;
  description?: string;
  targetUrl?: string;
  config?: WebhookConfig;
}

export interface RotateWebhookKeyResponse {
  message: string;
  webhook: Webhook;
}

export interface ListParams {
  limit?: number;
  offset?: number;
}
```

#### Methods

- `thirdParty:listDevelopers`
  - Payload: `ListParams | undefined`
  - Result: `PaginatedResponse<Developer>`
- `thirdParty:getDeveloper`
  - Payload: `{ id: number }`
  - Result: `Developer`
- `thirdParty:updateDeveloper`
  - Payload: `{ id: number; data: UpdateDeveloperRequest }`
  - Result: `Developer`
- `thirdParty:rotateDeveloperApiKey`
  - Payload: `{ id: number }`
  - Result: `RotateKeyResponse`
- `thirdParty:listApps`
  - Payload: `{ limit?: number; offset?: number; developerId?: number } | undefined`
  - Result: `PaginatedResponse<App>`
- `thirdParty:createApp`
  - Payload: `CreateAppRequest`
  - Result: `App`
- `thirdParty:getApp`
  - Payload: `{ id: number }`
  - Result: `App`
- `thirdParty:updateApp`
  - Payload: `{ id: number; data: UpdateAppRequest }`
  - Result: `App`
- `thirdParty:deleteApp`
  - Payload: `{ id: number }`
  - Result: `void`
- `thirdParty:listWebhooks`
  - Payload: `{ limit?: number; offset?: number; developerId?: number } | undefined`
  - Result: `PaginatedResponse<Webhook>`
- `thirdParty:createWebhook`
  - Payload: `CreateWebhookRequest`
  - Result: `Webhook`
- `thirdParty:getWebhook`
  - Payload: `{ id: number }`
  - Result: `Webhook`
- `thirdParty:updateWebhook`
  - Payload: `{ id: number; data: UpdateWebhookRequest }`
  - Result: `Webhook`
- `thirdParty:deleteWebhook`
  - Payload: `{ id: number }`
  - Result: `void`
- `thirdParty:rotateWebhookSigningKey`
  - Payload: `{ id: number }`
  - Result: `RotateWebhookKeyResponse`

## Permissions Reference

Apps must be registered with the required permissions. Common permissions:

- Wallet:
  - `wallet:getBalance`
  - `wallet:getBalanceFormatted`
  - `wallet:getAddress`
  - `wallet:getSmartAccount`
  - `wallet:transferERC20`
  - `wallet:approveERC20`
  - `wallet:transferNative`
  - `wallet:executeCall`
  - `wallet:transferFrontierDollar`
  - `wallet:transferInternalFrontierDollar`
  - `wallet:transferOverallFrontierDollar`
  - `wallet:executeBatchCall`
  - `wallet:getSupportedTokens`
  - `wallet:swap`
  - `wallet:quoteSwap`
  - `wallet:getUsdDepositInstructions`
  - `wallet:getEurDepositInstructions`
  - `wallet:getLinkedBanks`
  - `wallet:linkUsBankAccount`
  - `wallet:linkEuroAccount`
  - `wallet:deleteLinkedBank`
  - `wallet:getDeprecatedSmartAccounts`
  - `wallet:payWithFrontierDollar`
- Storage:
  - `storage:get`
  - `storage:set`
  - `storage:remove`
  - `storage:clear`
- Chain:
  - `chain:getCurrentNetwork`
  - `chain:getAvailableNetworks`
  - `chain:switchNetwork`
  - `chain:getCurrentChainConfig`
  - `chain:getContractAddresses`
- User:
  - `user:getDetails`
  - `user:getProfile`
  - `user:getReferralOverview`
  - `user:getReferralDetails`
  - `user:addUserContact`
  - `user:getOrCreateKyc`
- Partnerships:
  - `partnerships:listSponsors`
  - `partnerships:getSponsor`
  - `partnerships:createSponsorPass`
  - `partnerships:listActiveSponsorPasses`
  - `partnerships:listAllSponsorPasses`
  - `partnerships:getSponsorPass`
  - `partnerships:revokeSponsorPass`
- Third-Party:
  - `thirdParty:listDevelopers`
  - `thirdParty:getDeveloper`
  - `thirdParty:updateDeveloper`
  - `thirdParty:rotateDeveloperApiKey`
  - `thirdParty:listApps`
  - `thirdParty:createApp`
  - `thirdParty:getApp`
  - `thirdParty:updateApp`
  - `thirdParty:deleteApp`
  - `thirdParty:listWebhooks`
  - `thirdParty:createWebhook`
  - `thirdParty:getWebhook`
  - `thirdParty:updateWebhook`
  - `thirdParty:deleteWebhook`
  - `thirdParty:rotateWebhookSigningKey`

Wildcards like `wallet:*` and `storage:*` may be supported by the host permission system.

## App Registration

Apps must be registered in the host app registry before they can be installed. The exact file location for the registry depends on the host codebase, but the data model typically includes:

```ts
const APP_REGISTRY = [
  {
    id: 'your-app-id',
    url: 'https://your-app.com',
    developer: {
      name: 'Developer Name',
      url: 'https://developer.com',
      description: 'Developer description',
    },
    permissions: [
      'wallet:*',
      'storage:*',
      'user:*',
      'chain:*',
      // or specific permissions like:
      // 'wallet:getBalance',
      // 'storage:get',
      // 'storage:set',
    ],
    permissionDisclaimer: 'Description of what permissions are used for',
  },
];
```

### Permission System

- Permissions use the format `category:method` (e.g. `wallet:getBalance`).
- Wildcard `category:*` grants all methods in that category (if supported by the host).
- Permission checks happen on every SDK request.

## UI Utilities

### Detection Utilities

The SDK provides utilities to detect if your app is running inside Frontier Wallet.

```ts
import { FrontierSDK } from '@frontiertower/frontier-sdk';
import { isInFrontierApp, getParentOrigin } from '@frontiertower/frontier-sdk/ui-utils';

if (isInFrontierApp()) {
  const sdk = new FrontierSDK();
}

const origin = getParentOrigin();
```

### Standalone Message

Show a friendly message when the app is accessed outside Frontier Wallet.

```ts
import { renderStandaloneMessage, createStandaloneHTML } from '@frontiertower/frontier-sdk/ui-utils';

renderStandaloneMessage(document.body, 'My App Name');

const html = createStandaloneHTML('My App Name');
```

## App Development Guidelines

### HTML Structure

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

### SDK Client Implementation

IMPORTANT: The SDK is already provided as `@frontiertower/frontier-sdk`. Do not implement your own SDK client; import and use this package.

## Security Considerations

- Origin verification is performed by the host: apps should only accept messages from the expected parent origin.
- Apps run in a sandboxed iframe (host-controlled). Common sandbox flags include `allow-scripts`, `allow-same-origin`, `allow-forms`, and `allow-popups`.
- Storage is scoped per app by the host (commonly via a key prefix like `app:{appId}:`).

## Best Practices

### Error Handling

```ts
try {
  const balance = await sdk.getWallet().getBalance();
  console.log('Balance:', balance);
} catch (error: any) {
  if (String(error?.message || '').includes('Permission')) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

### Working with BigInt

- Prefer `bigint` for onchain amounts.
- If you must persist or transmit values outside the SDK, serialize to string and parse back.

### Responsive Design

```css
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
}
```

### Loading States

```ts
async function loadData() {
  setLoading(true);
  try {
    const [balance, address] = await Promise.all([
      sdk.getWallet().getBalance(),
      sdk.getWallet().getAddress(),
    ]);
    updateUI({ balance, address });
  } finally {
    setLoading(false);
  }
}
```

## Development Setup

### Local Development

```bash
npm run dev
```

### Testing with Host

1. Run your app on a local server.
2. Install/register the app through the host UI/registry.
3. Load it inside the wallet to validate permissions and `postMessage` behavior.

## Troubleshooting

### Permission Denied Errors

- Ensure the app is registered with the required permissions.
- Verify the permission strings match `category:method`.
- Use `category:*` only if the host supports wildcards.

### Origin Mismatch

- Ensure the app URL in the registry matches your actual origin.
- Avoid mixing `http`/`https` or `localhost`/`127.0.0.1` unexpectedly.

### Request Timeout

- Requests time out after 30 seconds.
- Verify the host is running and is responding to the request type.

## Resources

- Host app registry and SDK handler live in the host codebase (not this SDK package).
- This SDK package source of truth for API surface area is in:
  - `src/access/*`
  - `src/sdk.ts`
  - `src/ui-utils/*`

## Support

If something is unclear:

- Check this document.
- Check the access-class source in `src/access/*` for payload shapes.
- Validate permissions with the host registry.
