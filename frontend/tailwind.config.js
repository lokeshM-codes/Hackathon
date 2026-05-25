/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: '#0A0E1A',
        cyanneon: '#00F5FF',
        redalert: '#FF4444',
        greenok: '#00FF88',
        amberwarn: '#FFB800',
        purplemagic: '#8B5CF6',
        cardbg: 'rgba(30, 42, 58, 0.35)', // Glassmorphism cards
        borderblue: '#1E2A3A',
        borderglow: '#2B3D52',
        lightgray: '#A5B4FC'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        heading: ['"Syne"', 'sans-serif'],
      },
      boxShadow: {
        glowCyan: '0 0 12px rgba(0, 245, 255, 0.4)',
        glowRed: '0 0 18px rgba(255, 68, 68, 0.55)',
        glowGreen: '0 0 12px rgba(0, 255, 136, 0.35)',
        glowAmber: '0 0 12px rgba(255, 184, 0, 0.35)',
      },
      backgroundImage: {
        'scanlines': 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%)',
      },
      animation: {
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
