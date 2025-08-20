/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'museo': ['MuseoModerno-Regular'],
        'museo-medium': ['MuseoModerno-Medium'],
        'museo-semibold': ['MuseoModerno-SemiBold'],
        'museo-bold': ['MuseoModerno-Bold'],
        'museo-extrabold': ['MuseoModerno-ExtraBold'],
        'museo-black': ['MuseoModerno-Black'],
      },
    },
  },
  plugins: [],
};
