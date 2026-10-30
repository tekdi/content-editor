// ESM/UMD build — React is external (for framework consumers).
// `vite` (dev) serves index.html as a playground for the shell components.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4300,
    open: true,
    proxy: {
      '/action': { target: 'https://qa-lap.prathamdigital.org', changeOrigin: true, secure: false },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ShellManage',
      formats: ['es', 'umd'],
      fileName: (format) => `shell-manage.${format === 'umd' ? 'umd.cjs' : 'es.js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM', 'react-dom/client': 'ReactDOM' },
      },
    },
    sourcemap: true,
    outDir: 'dist',
  },
});
