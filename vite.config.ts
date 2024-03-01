import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import browserslistToEsbuild from 'browserslist-to-esbuild'


// https://vitejs.dev/config/
export default defineConfig({
  build: { target: browserslistToEsbuild() , outDir: "build"} ,
  plugins: [react()],
})
