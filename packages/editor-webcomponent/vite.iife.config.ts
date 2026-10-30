// IIFE build — bundles React + all deps for plain <script> tag use in index.html
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EditorWrapper',
      formats: ['iife'],
      fileName: () => 'editor-wrapper.iife.js',
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
  resolve: {
    alias: {
      '@editor/editor-core': resolve(__dirname, '../editor-core/src/index.ts'),
      '@editor/editor-content': resolve(__dirname, '../editor-content/src/index.ts'),
      '@editor/editor-course': resolve(__dirname, '../editor-course/src/index.ts'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
