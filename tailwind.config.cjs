/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0033a0",
          light: "#dce5f0",
          primary: "#0033a0",
          primary_hover: "#006DE2",
        },
        aliceblue: "#ecf5fa",
        royalblue: "#006de2",
        border: {
          primary: "hsla(0, 0%, 92%, 1)",
          secondary: "#CCCCCC",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
