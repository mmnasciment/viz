import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    // --- ESTA É A CORREÇÃO CRÍTICA ---
    fs: {
      // Impede o Vite de usar o .gitignore para bloquear arquivos
      deny: [],
    },
    // ---------------------------
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },
});