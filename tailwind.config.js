module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        helvetica_neue: ['Helvetica Neue', 'apple-system', 'system-ui', 'sans-serif'],
        otbulb_mono: ['OT Bulb Mono', 'apple-system', 'system-ui', 'sans-serif'],
      },
      colors: {
        fill: {
          primary: {
            DEFAULT: '#FFFFFF',
            dark: '#000000',
          },
          secondary: {
            DEFAULT: '#F5F5F7',
            dark: '#141414',
          },
          tertiary: {
            dark: '#1D1D1F'
          }
        },
        text: {
          primary: {
            DEFAULT: '#1D1D1F',
            dark: '#F5F5F7',
          },
          secondary: {
            DEFAULT: '#666666',
            dark: '#AAAAAA',
          },
        },
        stroke: {
          DEFAULT: '#D2D2D7',
          dark: '#444444'
        }
      },


    },
  },
  plugins: [],
}

