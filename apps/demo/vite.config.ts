import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 4200,
    open: true,
    proxy: {
    '/api': { target: 'https://dev-lap.prathamdigital.org', changeOrigin: true, secure: false },
    // shell-manage components call `{baseurl}/action/...` — with baseurl '' this proxy forwards them.
    '/action': { target: 'https://qa-lap.prathamdigital.org', changeOrigin: true, secure: false },
  },
  },
  resolve: {
    alias: {
      '@editor/editor-core': resolve(__dirname, '../../packages/editor-core/src/index.ts'),
      '@editor/editor-content': resolve(__dirname, '../../packages/editor-content/src/index.ts'),
      '@editor/editor-course': resolve(__dirname, '../../packages/editor-course/src/index.ts'),
      '@editor/editor-webcomponent': resolve(__dirname, '../../packages/editor-webcomponent/src/index.ts'),
      '@editor/shell-manage': resolve(__dirname, '../../packages/shell-manage/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
