import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        shell: "var(--color-shell)",
        slate: "var(--color-slate)",
        olive: "var(--color-olive)",
        brass: "var(--color-brass)",
        bone: "var(--color-bone)",
        ink: "var(--color-ink)",
        pine: "var(--color-pine)",
        mist: "var(--color-mist)",
      },
      fontFamily: {
        display: [
          "var(--font-display-family)",
          "Fraunces",
          "system-ui",
          "serif",
        ],
        sans: [
          "var(--font-body-family)",
          "Manrope",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        container: "var(--radius-container)",
        card: "var(--radius-card)",
        media: "var(--radius-media)",
        badge: "var(--radius-badge)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        panel: "var(--shadow-panel)",
        dialog: "var(--shadow-dialog)",
      },
      spacing: {
        18: "var(--space-18)",
      },
    },
  },
  plugins: [],
};

export default config;
