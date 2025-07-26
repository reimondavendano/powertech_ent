/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{html,js,ts,jsx,tsx,mdx}', // Adjust based on your project structure
    './components/**/*.{html,js,ts,jsx,tsx,mdx}', // Adjust based on your project structure
    './app/**/*.{html,css,js,ts,jsx,tsx,mdx}', // For Next.js App Router
    './src/**/*.{html,css,js,ts,jsx,tsx,mdx}', // If you have a 'src' directory
    './public/**/*.html', // If you have static HTML files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};