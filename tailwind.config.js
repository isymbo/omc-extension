/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#dfe5fa',
          200: '#c7d2f5',
          300: '#a4b4ed',
          400: '#6b82d9',
          500: '#4558c8',
          600: '#3346b4',
          700: '#2a3a96',
          900: '#1a2560',
        },
        gray: {
          50: '#f7f7f5',
          100: '#f0f0ee',
          200: '#e4e3e0',
          300: '#cbcbca',
          400: '#a1a1a1',
          500: '#787878',
          600: '#575757',
          700: '#3a3a3a',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        body: ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Segoe UI"', 'sans-serif'],
        display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
