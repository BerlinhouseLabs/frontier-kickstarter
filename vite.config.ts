import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    cors: {
      origin: [
        'http://localhost:5173',
        'https://sandbox.os.frontiertower.io',
        'https://alpha.os.frontiertower.io',
        'https://beta.os.frontiertower.io',
        'https://os.frontiertower.io'
      ],
      credentials: false
    }
  },
});
