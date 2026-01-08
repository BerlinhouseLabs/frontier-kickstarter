import { FrontierSDK, type User, type WalletBalanceFormatted } from '@frontiertower/frontier-sdk';
import { isInFrontierApp, renderStandaloneMessage } from '@frontiertower/frontier-sdk/ui-utils';
import './style.css';

const sdk = new FrontierSDK();

const CHRISTIANPETERS_ETH = '0x0a3772AA1432D31CDB2e90246525496e65E99ad8';

async function init() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  // Check if running standalone
  if (!isInFrontierApp()) {
    renderStandaloneMessage(app, 'Kickstarter');
    return;
  }
  
  try {
    // Show loading
    app.innerHTML = '<div class="loading">Loading...</div>';

    // Fetch user data
    const user = await sdk.getUser().getDetails();

    // Fetch wallet data
    let balance = await sdk.getWallet().getBalanceFormatted();
    const address = await sdk.getWallet().getAddress();

    // Get stored counter or initialize
    let counter = await sdk.getStorage().get('counter') || 0;
    let isSending = false;
    let sendStatus = '';

    // Render and setup button handlers
    const renderAndAttach = () => {
      render(app, user, balance, address, counter, isSending, sendStatus);
      
      // Re-attach increment button listener
      const incrementBtn = document.querySelector('#increment-btn');
      incrementBtn?.addEventListener('click', async () => {
        counter++;
        await sdk.getStorage().set('counter', counter);
        renderAndAttach();
      });

      // Attach send button listener
      const sendBtn = document.querySelector<HTMLButtonElement>('#send-btn');
      sendBtn?.addEventListener('click', async () => {
        isSending = true;
        sendStatus = '';
        renderAndAttach();

        try {
          const receipt = await sdk.getWallet().transferFrontierDollar(
            CHRISTIANPETERS_ETH,
            '1.00'
          );
          
          // Refetch balance after successful transfer
          balance = await sdk.getWallet().getBalanceFormatted();
          sendStatus = `✅ Sent! Tx: ${receipt.transactionHash.slice(0, 10)}...`;
        } catch (error) {
          sendStatus = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        } finally {
          isSending = false;
          renderAndAttach();
        }
      });
    };

    renderAndAttach();

  } catch (error) {
    console.log(error);
    app.innerHTML = `
      <div class="container">
        <h1>❌ Error</h1>
        <div class="card">
          <p><strong>Failed to load:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    `;
  }
}

function render(container: HTMLElement, user: User, balance: WalletBalanceFormatted, address: string, counter: number, isSending: boolean, sendStatus: string) {
  // Parse balance to check if > 0
  const balanceValue = parseFloat(balance.total.replace('$', ''));
  const hasBalance = balanceValue > 0;

  // Create greeting
  const userName = user.firstName || 'Citizen'
  const greeting = `👋 Hello, ${userName}!`;

  container.innerHTML = `
    <div class="container">      
      <div class="card">
        <p style="text-align: center;">${greeting}</p>
      </div>

      <div class="card">
        <h2>Wallet Demo</h2>
        <p><strong>Address:</strong> ${address.slice(0, 6)}...${address.slice(-4)}</p>
        <p><strong>Total Balance:</strong> ${balance.total} <small style="color: #888;">of which ${balance.internalFtd} are iFTD</small></p>
        ${hasBalance ? `
          <button 
            id="send-btn" 
            ${isSending ? 'disabled' : ''}
            style="margin-top: 10px; padding: 8px 16px; font-size: 14px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: ${isSending ? 'not-allowed' : 'pointer'}; opacity: ${isSending ? '0.6' : '1'};"
          >
            ${isSending ? '⏳ Sending...' : '💸 Send $1 to chp!'}
          </button>
          ${sendStatus ? `<p style="margin-top: 10px; font-size: 14px;">${sendStatus}</p>` : ''}
        ` : '<p style="margin-top: 10px; color: #888; font-size: 14px;">⚠️ Need balance to send</p>'}
      </div>

      <div class="card">
        <h2>Persistent Storage Demo</h2>
        <p>This counter is stored in the host PWA's localStorage:</p>
        <div class="counter">${counter}</div>
        <button id="increment-btn">Increment Counter</button>
      </div>
    </div>
  `;
}

init();
