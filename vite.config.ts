import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    cors: {
      origin: [
        'http://localhost:5173',
        'https://sandbox.wallet.frontiertower.io',
        'https://alpha.wallet.frontiertower.io',
        'https://beta.wallet.frontiertower.io',
        'https://wallet.frontiertower.io'
      ],
      credentials: false
    }
  },
});
