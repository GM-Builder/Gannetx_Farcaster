import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Preserve CSS variable tokens
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Dark-mode palette tuned to match QuestDashboard component
        slate: {
          900: '#0b1220', // deep background
          800: '#111827',
          700: '#1f2937',
          600: '#263144',
          500: '#374151',
          400: '#4b5563',
        },

        cyan: {
          400: '#22d3ee',
          500: '#06b6d4'
        },

        blue: {
          400: '#60a5fa',
          500: '#3b82f6'
        },

        emerald: {
          400: '#34d399',
          500: '#10b981'
        },

        purple: {
          400: '#8b5cf6',
          500: '#7c3aed'
        }
      },
    },
  },
  plugins: [],
};
export default config;