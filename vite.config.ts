import path from 'node:path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      proxy: {
        '/gpt-service': env.VITE_API_BASE_URL,
      },
    },
    plugins: [
      react(),
      dts({
        insertTypesEntry: true,
      }),
    ],
    build: {
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, './src/lib/index.ts'),
        name: 'ReactChatGPT',
        formats: ['es', 'umd'],
        fileName: (format) => `react-chatgpt.${format}.js`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'tailwindcss'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            tailwindcss: 'tailwindcss',
          },
        },
      },
    },
  }
})
