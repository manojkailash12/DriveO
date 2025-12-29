import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      hmr: {
        overlay: false // Disable error overlay notifications
      },
      proxy: mode === "development" ? {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : {}
    }
  }
})
