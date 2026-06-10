import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  // 🔥 ใส่เพิ่มตรงนี้ครับ! เพื่อสั่งให้ Vite ถอยออกไปอ่านไฟล์ .env ที่อยู่โฟลเดอร์นอกสุด
  envDir: '../'
})
