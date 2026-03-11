/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: "#0a0a0f",
          surface: "#111118",
          border: "#1e1e2e",
          accent: "#6c63ff",
          accentHover: "#7c74ff",
          green: "#00d68f",
          red: "#ff4d6d",
          yellow: "#ffd166",
          text: "#e2e2f0",
          muted: "#6b6b8a",
        },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};