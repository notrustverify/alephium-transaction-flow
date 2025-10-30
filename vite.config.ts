import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH && env.VITE_BASE_PATH !== '' ? env.VITE_BASE_PATH : '/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            reactflow: ['reactflow'],
            alephium: ['@alephium/web3'],
          },
        },
      },
    },
  };
});

