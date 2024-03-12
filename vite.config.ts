import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import browserslistToEsbuild from 'browserslist-to-esbuild'


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: Number(process.env.PORT) || undefined,
  },
  build: { target: browserslistToEsbuild() , outDir: "build"} ,
  plugins: [react()],
})
