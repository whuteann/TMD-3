module.exports = {
  content: ['./src/components/**/*.{tsx,jsx}', './src/features/**/*.{tsx,jsx}'],
  theme: {
    fontFamily: {
      'sans': 'Poppins',
      // 'bold': 'Poppins700Bold',
      // 'italic': 'Poppins400RegularItalics'

      // Poppins100Thin: number;
      // Poppins300Light: number;
      // Poppins400Regular: number;
      // Poppins500Medium: number;
      // Poppins600SemiBold: number;
      // Poppins700Bold: number;
      // Poppins400RegularItalics

    },
    extend: {
      colors: {
        'primary': '#EF5713',
        'cream': '#FFFCF7',
        gray: {
          'primary': '#818181',
          'secondary': '#D5D5D5',
          'faded': 'rgba(0,0,0,0.1)'
        }
      },
      fontSize: {
        '12px': '12px',
        '14px': '14px',
        '15px': '15px',
        '16px': '16px',
        '18px': '18px',
        '20px': '20px',
        '22px': '22px',
        '25px': '25px',
        '28px': '28px',
        '30px': '30px',
      },
      zIndex: {
        '999': '999',
      }
    },
  },
  plugins: [],
  corePlugins: {
    transform: false,
    translate: false,
    boxShadow: false
  }
}
