/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        espresso: {
          50: "#FDF8F6", // Lightest cream
          100: "#F9E8E1", // Light cream
          200: "#F4D4C8", // Warm cream
          300: "#E8BBB0", // Light peach
          400: "#D4A294", // Warm peach
          500: "#8B4513", // Coffee brown
          600: "#693311", // Dark coffee
          700: "#4A240D", // Deep coffee
          800: "#2C1810", // Rich espresso
          900: "#1A0F0A", // Darkest espresso
        },
        cream: {
          light: "#FDF8F6",
          DEFAULT: "#F9E8E1",
          dark: "#F4D4C8",
        },
        mocha: {
          light: "#8B4513",
          DEFAULT: "#693311",
          dark: "#4A240D",
        },
        accent: {
          peach: "#E8BBB0",
          gold: "#D4A294",
          warm: "#F9E8E1",
        },
      },
      backgroundImage: {
        "gradient-warm": "linear-gradient(to bottom right, #FDF8F6, #F9E8E1)",
      },
      boxShadow: {
        warm: "0 0 15px rgba(232, 187, 176, 0.1)",
        "inner-warm": "inset 0 0 15px rgba(232, 187, 176, 0.05)",
      },
      fontFamily: {
        'vanderleck': ['VanDerLeck', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
