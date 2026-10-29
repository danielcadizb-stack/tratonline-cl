import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        trato: {
          dark: "#0F1923",
          mid: "#1C2B3A",
          steel: "#2C4A63",
          green: "#1A7F5A",
          "green-l": "#22A374",
          "green-bg": "#E8F5F0",
          amber: "#C47D1A",
          "amber-bg": "#FDF3E3",
          white: "#F8FAFB",
          gray1: "#EEF1F4",
          gray2: "#C8D2DC",
          gray3: "#7A8FA0",
          text: "#0F1923",
          text2: "#4A6070",
          border: "#D8E2EB",
          danger: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        trato: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
