/**
 * Configuração do Vite (build do front-end).
 * Em desenvolvimento, o Vite roda dentro do `server.ts` (modo middleware).
 */
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    // HMR pode ser desligado por variável de ambiente (útil em editores remotos).
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
