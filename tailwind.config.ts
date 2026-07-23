import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      // Semantic names for color pairs repeated across components; values
      // match the existing gray scale exactly (see per-line comments below).
      colors: {
        surface: { DEFAULT: "#ffffff", dark: "#111827" }, // white / gray-900
        line: { DEFAULT: "#e5e7eb", dark: "#1f2937" }, // gray-200 / gray-800
        divider: { DEFAULT: "#f3f4f6", dark: "#1f2937" }, // gray-100 / gray-800
        muted: { DEFAULT: "#9ca3af", dark: "#6b7280" }, // gray-400 / gray-500
      },
    },
  },
  plugins: [],
};

export default config;
