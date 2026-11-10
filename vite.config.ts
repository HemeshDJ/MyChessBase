import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pagesBuild = process.env.npm_lifecycle_event === 'build:pages'
if (pagesBuild) {
  process.env.VITE_ENGINE ??= 'browser'
  process.env.GITHUB_PAGES_BASE_PATH ??= 'MyChessBase'
}

const pagesBase = process.env.GITHUB_PAGES_BASE_PATH

export default defineConfig({
  base: pagesBase ? `/${pagesBase}/` : '/',
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/engine/**'],
    },
  },
})
