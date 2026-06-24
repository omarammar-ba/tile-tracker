
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // رفع حد التنبيه إلى 1600 كيلوبايت لمنع ظهور الرسالة الصفراء
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // فصل مكتبات النظام عن كود التطبيق لتسريع التحميل
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
