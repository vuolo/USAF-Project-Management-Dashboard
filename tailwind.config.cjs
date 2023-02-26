/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0033a0",
          light: "#dce5f0",
        },
      },
    },
  },
  plugins: [],
};
