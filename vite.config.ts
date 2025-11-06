import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    cors: {
      origin: [
        'http://localhost:5173',
        'https://staging.wallet.frontiertower.io',
        'https://alpha.wallet.frontiertower.io',
        'https://beta.wallet.frontiertower.io',
        'https://wallet.frontiertower.io'
      ],
      credentials: false
    }
  },
});
