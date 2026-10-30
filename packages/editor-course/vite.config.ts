import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EditorCourse',
      formats: ['es', 'umd'],
      fileName: (format) => `editor-course.${format === 'umd' ? 'umd.cjs' : 'es.js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@editor/editor-core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@editor/editor-core': 'EditorCore',
        },
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@editor/editor-core': resolve(__dirname, '../editor-core/src/index.ts'),
    },
  },
});
