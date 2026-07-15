/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#05040A",
        surface: "#12101F",
        arm: {
          green: "#CFFF04",
          orange: "#FF2A6D",
          blue: "#00F0FF",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
