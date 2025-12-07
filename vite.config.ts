import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 【新增】服务器配置，解决跨域和网络错误

  server: {
    port: 5173, // 或者 5174，Vite 会自动选
    allowedHosts: true,
    proxy: {
      // 【新增规则】拦截 /user 开头的请求，转发给后端
      '/user': {
        target: 'http://localhost:8080', // 后端地址
        changeOrigin: true,
        // 这里不需要 rewrite 去掉前缀，因为后端 Controller 本来就是 /user
      },

      // 【预判】如果你做了物品管理，这里也要加 /goods
      '/goods': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      // 【头像上传】如果有上传功能，也要加
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
