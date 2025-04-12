module.exports = {
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./client/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff5a5f",
        secondary: "#00a699",
        background: "#f7f7f7",
        text: "#484848",
        success: "#4caf50",
        warning: "#ff9800",
        error: "#f44336",
      },
      fontFamily: {
        sans: ["Cairo", "Tajawal", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
