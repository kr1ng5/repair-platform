import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/repair-platform/' : '/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0'
  }
}))
