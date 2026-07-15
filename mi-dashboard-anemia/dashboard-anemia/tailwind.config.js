/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores clínicos personalizados para anemia infantil
        'clinical-red': '#8B1C1C',
        'clinical-beige': '#F5E6D3',
        'clinical-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
