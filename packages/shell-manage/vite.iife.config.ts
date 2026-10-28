// IIFE build — bundles React + all deps for plain <script> tag use in host projects
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ShellManage',
      formats: ['iife'],
      fileName: () => 'shell-manage.iife.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: false, // don't wipe ESM output
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
