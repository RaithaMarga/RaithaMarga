import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: (env.VITE_API_BASE_URL || 'https://raithamarga-backend.onrender.com').replace(/\/+$/, ''),
          changeOrigin: true,
          secure: true,
          // Browsers add an Origin header to POST/PATCH even for same-origin calls to this
          // dev server. The backend would then check it against CORS_ALLOWED_ORIGINS and
          // answer "Invalid CORS request" (403) for any local address it doesn't list.
          // Dropping it makes local development work from any port or host.
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
            });
          },
        },
      },
    },
  };
});
