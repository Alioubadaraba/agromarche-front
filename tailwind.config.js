module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vert: { 50: '#f0fdf0', 100: '#dcfce7', 500: '#1D6A3A', 600: '#166031', 700: '#0f4d26' },
        or:   { 100: '#fef9c3', 500: '#D97706', 600: '#B45309' },
        terre:{ 100: '#fdf2e9', 500: '#C2681A', 600: '#A0521A' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
