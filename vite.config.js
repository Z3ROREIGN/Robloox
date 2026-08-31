import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        produto: resolve(__dirname, 'produto.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        orders: resolve(__dirname, 'orders.html'),
        chat: resolve(__dirname, 'chat.html'),
      },
    },
  },
});
