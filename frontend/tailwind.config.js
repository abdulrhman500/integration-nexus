/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          hubspot: '#ff7a59',
          notion: '#2f3437',
          airtable: '#18bfff',
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite',
        }
      },
    },
    plugins: [],
  }