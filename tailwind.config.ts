import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lounge: {
          ink: "#07080b",
          panel: "#10131a",
          glass: "rgba(255,255,255,0.08)",
          line: "rgba(255,255,255,0.16)",
          mist: "#d8ecfb",
          champagne: "#e8d6b5",
          pearl: "#f7f8fb"
        }
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0,0,0,0.35)"
      },
      backgroundImage: {
        "lounge-radial":
          "radial-gradient(circle at 18% 18%, rgba(216,236,251,0.18), transparent 34%), radial-gradient(circle at 84% 12%, rgba(232,214,181,0.15), transparent 30%), linear-gradient(135deg, #07080b 0%, #111722 54%, #0b0d13 100%)"
      }
    }
  },
  plugins: []
};

export default config;

