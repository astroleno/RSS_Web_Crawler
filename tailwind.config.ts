import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'gradient-breathe': {
          '0%, 100%': { 
            'background-position': '0% 50%',
            'background-size': '100% 100%'
          },
          '50%': { 
            'background-position': '100% 50%',
            'background-size': '200% 200%'
          },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'gradient-breathe': 'gradient-breathe 8s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
