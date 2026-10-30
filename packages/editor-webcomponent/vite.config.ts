// ESM build — React is external (for framework consumers)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EditorWrapper',
      formats: ['es', 'umd'],
      fileName: (format) => `editor-wrapper.${format === 'umd' ? 'umd.cjs' : 'es.js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
    sourcemap: true,
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@editor/editor-core': resolve(__dirname, '../editor-core/src/index.ts'),
      '@editor/editor-content': resolve(__dirname, '../editor-content/src/index.ts'),
      '@editor/editor-course': resolve(__dirname, '../editor-course/src/index.ts'),
    },
  },
});
