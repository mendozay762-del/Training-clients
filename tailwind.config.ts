import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        base: "rgb(var(--bg-base) / <alpha-value>)",
        card: "rgb(var(--bg-card) / <alpha-value>)",
        "card-hover": "rgb(var(--bg-card-hover) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-tertiary": "rgb(var(--text-tertiary) / <alpha-value>)",
        "accent-blue": "rgb(var(--accent-blue) / <alpha-value>)",
        "accent-green": "rgb(var(--accent-green) / <alpha-value>)",
        "accent-red": "rgb(var(--accent-red) / <alpha-value>)",
        "accent-amber": "rgb(var(--accent-amber) / <alpha-value>)",
        "border-subtle": "rgb(var(--border-subtle) / <alpha-value>)",
      },
      borderRadius: {
        card: "12px",
        btn: "10px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
