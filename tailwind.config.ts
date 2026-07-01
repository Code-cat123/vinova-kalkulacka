import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          50: "#fbf3f5",
          100: "#f6e1e7",
          600: "#9d2449",
          700: "#7a1c39",
          800: "#641730",
          900: "#4a1124",
        },
      },
    },
  },
  plugins: [],
};

export default config;
