import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * `vite dev` doesn't serve the `api/` directory — that's Vercel's job in
 * production. This mounts the same handler as dev middleware so `npm run dev`
 * behaves like the deployed site, with HMR on the handler itself.
 */
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/github', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/github.js')
          await mod.default(req, res)
        } catch (e) {
          server.ssrFixStacktrace(e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'dev_handler_failed', message: String(e) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Empty prefix loads unprefixed vars (GITHUB_TOKEN) into process.env for the
  // dev handler above. This never reaches client code — only VITE_* does that.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), tailwindcss(), devApi()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split vendor code so it caches independently of app code — editing
          // a component no longer invalidates React and Motion for returning visitors.
          manualChunks: {
            motion: ['motion'],
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  }
})
