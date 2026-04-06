import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function serveMediaPlugin() {
  const mediaRoot = path.resolve(__dirname, './dashboard/documentos/media')
  return {
    name: 'serve-media',
    configureServer(server) {
      server.middlewares.use('/media', (req, res, next) => {
        const filePath = path.join(mediaRoot, decodeURIComponent(req.url))
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          const ext = path.extname(filePath).toLowerCase()
          const mimeTypes = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
            '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm',
          }
          if (mimeTypes[ext]) res.setHeader('Content-Type', mimeTypes[ext])
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveMediaPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) {
            return 'vendor-d3'
          }
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts'
          }
        },
      },
    },
  },
})
