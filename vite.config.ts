import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

// Chrome DevTools probes this on localhost; answer 404 instead of letting the router throw. Dev only.
const silenceDevtoolsProbe: Plugin = {
  name: 'silence-devtools-probe',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
      res.statusCode = 404
      res.end()
    })
  },
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // reactRouter() must precede tailwindcss() or module resolution breaks.
  plugins: [silenceDevtoolsProbe, reactRouter(), tailwindcss()],
})
