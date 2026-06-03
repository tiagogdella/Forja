import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath} from 'node:url'

export default defineConfig({
    plugins: [vue()],

     optimizeDeps: {
     entries: ['index.html']
    },

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },

    server: {
        proxy: {
            '/api' : {
                target: 'https://hackeando-seu-treino.onrender.com',
                changeOrigin: true
            }
        }
    },

    build: {
        outDir: 'dist'
    }

})