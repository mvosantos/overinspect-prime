// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Esta linha é crucial: ela diz ao Tailwind onde estão seus componentes React
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      // Adicione suas customizações aqui, se necessário
    },
  },
  plugins: [],
}