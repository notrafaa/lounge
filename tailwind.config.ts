import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lounge: {
          ink: "#151b24",
          panel: "#202735",
          glass: "rgba(232,226,216,0.075)",
          line: "rgba(232,226,216,0.16)",
          mist: "#92b4d6",
          champagne: "#e8e1d7",
          pearl: "#f3efe9",
          online: "#4fc878"
        }
      },
      boxShadow: {
        glass: "0 24px 80px rgba(5,9,14,0.42)"
      },
      backgroundImage: {
        "lounge-radial":
          "radial-gradient(circle at 14% 10%, rgba(232,225,215,0.12), transparent 32%), radial-gradient(circle at 86% 4%, rgba(79,200,120,0.08), transparent 26%), linear-gradient(135deg, #111720 0%, #1b2330 48%, #141a23 100%)"
      }
    }
  },
  plugins: []
};

export default config;
