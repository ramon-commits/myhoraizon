import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind verwijderd: de app gebruikt geen utility-classes (alleen inline-stijlen
// + de design-blauwdruk-CSS). Tailwind genereerde utilities uit gedetecteerde
// class-namen en botste zo met blauwdruk-classes (bv. `ring` -> box-shadow-kader).
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }, // horaizon-brain draait op 5173
})
