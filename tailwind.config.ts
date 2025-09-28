/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",        // Inclui arquivos do App Router
    "./pages/**/*.{ts,tsx}",      // Inclui arquivos do Pages Router
    "./components/**/*.{ts,tsx}", // Inclui arquivos de componentes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
