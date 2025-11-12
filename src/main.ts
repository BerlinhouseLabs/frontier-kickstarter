import { FrontierSDK, type User } from '@frontiertower/frontier-sdk';
import { isInFrontierApp, renderStandaloneMessage } from '@frontiertower/frontier-sdk/ui-utils';
import './style.css';

type SwapQuote = {
  amountOut: bigint;
  minimumAmountOut: bigint;
  routerAddress: string;
  calldata: string;
  value: bigint;
};

const sdk = new FrontierSDK();

const CHAIN_ID = 8453; // Base mainnet
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c3bc123e0f4f70b786';
const ETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

async function init() {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('App container not found');
  }

  if (!isInFrontierApp()) {
    renderStandaloneMessage(app, 'ETH → USDC Swap');
    return;
  }

  app.innerHTML = '<div class="loading">Loading swap experience...</div>';

  try {
    const [user, address, balance] = await Promise.all([
      sdk.getUser().getDetails(),
      sdk.getWallet().getAddress(),
      sdk.getWallet().getBalanceFormatted(),
    ]);

    let amountInput = '';
    let quote: SwapQuote | null = null;
    let quoteError = '';
    let infoMessage = '';
    let isFetchingQuote = false;
    let isSwapping = false;

    const render = () => {
      const estimatedUsdc = quote ? formatUnits(quote.amountOut, USDC_DECIMALS, 4) : '--';
      const minimumUsdc = quote ? formatUnits(quote.minimumAmountOut, USDC_DECIMALS, 4) : '--';

      app.innerHTML = `
        <div class="swap-container">
          <header class="swap-header">
            <h1>Swap ETH for USDC</h1>
            <p class="swap-subtitle">A minimal Uniswap-powered swap inside Frontier Tower.</p>
          </header>

          <section class="wallet-summary">
            <p><strong>User:</strong> ${formatUserName(user)}</p>
            <p><strong>Wallet:</strong> ${truncateAddress(address)}</p>
            <p><strong>Balance:</strong> ${balance}</p>
          </section>

          <section class="swap-card">
            <div class="field">
              <label for="amount-input">You pay</label>
              <div class="field-row">
                <span class="token-label">ETH</span>
                <input
                  id="amount-input"
                  type="number"
                  min="0"
                  step="0.0001"
                  placeholder="0.0"
                  value="${amountInput}"
                  ${isFetchingQuote || isSwapping ? 'disabled' : ''}
                />
              </div>
            </div>

            <div class="field">
              <label>You receive (estimated)</label>
              <div class="quote-row">
                <span class="token-label">USDC</span>
                <span class="quote-value">${estimatedUsdc}</span>
              </div>
              ${quote ? `<p class="helper-text">Minimum received: ${minimumUsdc} USDC</p>` : ''}
            </div>

            ${quoteError ? `<p class="error-message">${quoteError}</p>` : ''}
            ${infoMessage ? `<p class="status-message">${infoMessage}</p>` : ''}

            <button id="quote-btn" ${isFetchingQuote || isSwapping ? 'disabled' : ''}>
              ${isFetchingQuote ? 'Fetching quote…' : 'Get Quote'}
            </button>

            <button id="swap-btn" ${!quote || isSwapping ? 'disabled' : ''}>
              ${isSwapping ? 'Swapping…' : 'Swap ETH → USDC'}
            </button>

            <p class="helper-text">Quotes use Uniswap on Base mainnet (chain ID ${CHAIN_ID}).</p>
          </section>
        </div>
      `;

      const amountInputElement = document.querySelector<HTMLInputElement>('#amount-input');
      amountInputElement?.addEventListener('input', (event) => {
        amountInput = (event.target as HTMLInputElement).value;
        quote = null;
        quoteError = '';
        infoMessage = '';
        render();
      });

      const quoteButton = document.querySelector<HTMLButtonElement>('#quote-btn');
      quoteButton?.addEventListener('click', async () => {
        quoteError = '';
        infoMessage = '';

        if (!amountInput || Number(amountInput) <= 0) {
          quoteError = 'Enter the amount of ETH you want to swap.';
          render();
          return;
        }

        try {
          isFetchingQuote = true;
          render();

          quote = await fetchQuote(amountInput);
          infoMessage = `Estimated output: ${formatUnits(quote.amountOut, USDC_DECIMALS, 4)} USDC`;
        } catch (error) {
          quote = null;
          quoteError = error instanceof Error ? error.message : 'Failed to fetch quote.';
        } finally {
          isFetchingQuote = false;
          render();
        }
      });

      const swapButton = document.querySelector<HTMLButtonElement>('#swap-btn');
      swapButton?.addEventListener('click', async () => {
        if (!quote) {
          return;
        }

        try {
          isSwapping = true;
          quoteError = '';
          infoMessage = 'Confirm the transaction in your wallet…';
          render();

          const receipt = await sdk.getWallet().executeCall({
            to: quote.routerAddress,
            data: quote.calldata,
            value: quote.value,
          });

          infoMessage = `Swap submitted! Tx: ${receipt.transactionHash.slice(0, 10)}…`;
          quote = null;
          amountInput = '';
        } catch (error) {
          quoteError = error instanceof Error ? error.message : 'Swap failed.';
        } finally {
          isSwapping = false;
          render();
        }
      });
    };

    render();
  } catch (error) {
    app.innerHTML = `
      <div class="error-state">
        <h2>Unable to load swap app</h2>
        <p>${error instanceof Error ? error.message : 'Unexpected error occurred.'}</p>
      </div>
    `;
  }
}

async function fetchQuote(amountEth: string): Promise<SwapQuote> {
  const amountWei = parseUnits(amountEth, ETH_DECIMALS);

  if (amountWei <= 0n) {
    throw new Error('Amount must be greater than zero.');
  }

  const params = new URLSearchParams({
    chainId: CHAIN_ID.toString(),
    tokenIn: WETH_ADDRESS,
    tokenOut: USDC_ADDRESS,
    amount: amountWei.toString(),
    type: 'exactInput',
  });

  const response = await fetch(`https://interface.gateway.uniswap.org/v1/quote?${params.toString()}`);

  if (!response.ok) {
    const errorBody = await safeReadJson(response);
    throw new Error(errorBody?.message ?? 'Quote request failed.');
  }

  const data = await response.json();

  if (!data?.methodParameters) {
    throw new Error('Uniswap quote did not include execution parameters.');
  }

  const amountOut = BigInt(data.quote ?? '0');
  const minimumAmountOut = BigInt(data.guaranteedQuote ?? data.quote ?? '0');
  const routerAddress: string = data.methodParameters.to;
  const calldata: string = data.methodParameters.calldata;
  const value = BigInt(data.methodParameters.value ?? '0');

  if (!routerAddress || !calldata) {
    throw new Error('Missing swap transaction data.');
  }

  return {
    amountOut,
    minimumAmountOut,
    routerAddress,
    calldata,
    value,
  };
}

function parseUnits(value: string, decimals: number): bigint {
  const base = 10n ** BigInt(decimals);
  const normalized = value.trim();

  if (!normalized) {
    return 0n;
  }

  if (!/^\d*(\.\d*)?$/.test(normalized)) {
    throw new Error('Enter a valid decimal number.');
  }

  const [wholePart, fractionPart = ''] = normalized.split('.');
  const whole = wholePart === '' ? '0' : wholePart;
  const fraction = (fractionPart + '0'.repeat(decimals)).slice(0, decimals);

  return BigInt(whole) * base + BigInt(fraction);
}

function formatUnits(value: bigint, decimals: number, precision = 4): string {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionString = fraction.toString().padStart(decimals, '0').slice(0, precision);
  return `${whole.toString()}.${fractionString.replace(/0+$/, '') || '0'}`;
}

function formatUserName(user: User): string {
  if (user.firstName) return user.firstName;
  if (user.username) return user.username;
  return 'Frontier user';
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

async function safeReadJson(response: Response): Promise<any | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

init();
