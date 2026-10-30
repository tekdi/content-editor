import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EditorCore',
      formats: ['es', 'umd'],
      fileName: (format) => `editor-core.${format === 'umd' ? 'umd.cjs' : 'es.js'}`,
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@editor/editor-core': resolve(__dirname, 'src/index.ts'),
    },
  },
});
