import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 1. 允许局域网/公网访问 (必填)
    host: '0.0.0.0',
    port: 5177,
     allowedHosts: true,
    proxy: {
      // 1. 用户相关接口
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 2. 物品相关接口
      '/goods': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 3. 记录相关接口 (关键！)
      '/record': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 4. 头像/文件相关
      '/avatar': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 兼容某些可能的写法
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
