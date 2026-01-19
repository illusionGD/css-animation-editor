import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // 全局导入 mixin 和变量，所有组件都可以直接使用
        // 使用 @use 替代 @import，as * 表示不需要命名空间
        additionalData: `@use "@/assets/styles/variables" as *; @use "@/assets/styles/mixins" as *;`
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
