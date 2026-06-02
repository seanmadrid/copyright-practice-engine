/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(199, 100%, 97%)',
            '100': 'hsl(199, 100%, 94%)',
            '200': 'hsl(199, 100%, 86%)',
            '300': 'hsl(199, 100%, 76%)',
            '400': 'hsl(199, 100%, 64%)',
            '500': 'hsl(199, 100%, 50%)',
            '600': 'hsl(199, 100%, 40%)',
            '700': 'hsl(199, 100%, 32%)',
            '800': 'hsl(199, 100%, 24%)',
            '900': 'hsl(199, 100%, 16%)',
            '950': 'hsl(199, 100%, 10%)',
            DEFAULT: '#001722'
        },
        secondary: {
            '50': 'hsl(208, 11%, 97%)',
            '100': 'hsl(208, 11%, 94%)',
            '200': 'hsl(208, 11%, 86%)',
            '300': 'hsl(208, 11%, 76%)',
            '400': 'hsl(208, 11%, 64%)',
            '500': 'hsl(208, 11%, 50%)',
            '600': 'hsl(208, 11%, 40%)',
            '700': 'hsl(208, 11%, 32%)',
            '800': 'hsl(208, 11%, 24%)',
            '900': 'hsl(208, 11%, 16%)',
            '950': 'hsl(208, 11%, 10%)',
            DEFAULT: '#464f57'
        },
        accent: {
            '50': 'hsl(185, 11%, 97%)',
            '100': 'hsl(185, 11%, 94%)',
            '200': 'hsl(185, 11%, 86%)',
            '300': 'hsl(185, 11%, 76%)',
            '400': 'hsl(185, 11%, 64%)',
            '500': 'hsl(185, 11%, 50%)',
            '600': 'hsl(185, 11%, 40%)',
            '700': 'hsl(185, 11%, 32%)',
            '800': 'hsl(185, 11%, 24%)',
            '900': 'hsl(185, 11%, 16%)',
            '950': 'hsl(185, 11%, 10%)',
            DEFAULT: '#869c9e'
        },
        'neutral-50': '#000000',
        'neutral-100': '#ffffff',
        'neutral-200': '#212529',
        'neutral-300': '#ececec',
        'neutral-400': '#f2f7fc',
        'neutral-500': '#343a40',
        'neutral-600': '#cccccc',
        'neutral-700': '#2e2e2e',
        background: '#ffffff',
        foreground: '#000000'
    },
    fontFamily: {
        sans: [
            'Nunito',
            'sans-serif'
        ],
        body: [
            'babri-icons',
            'sans-serif'
        ],
        font2: [
            'Bitter',
            'sans-serif'
        ]
    },
    fontSize: {
        '15': [
            '15px',
            {
                lineHeight: '0px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '18': [
            '18px',
            {
                lineHeight: '48px'
            }
        ],
        '19': [
            '19px',
            {
                lineHeight: '19px'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '20px'
            }
        ],
        '21': [
            '21px',
            {
                lineHeight: '21px'
            }
        ],
        '22': [
            '22px',
            {
                lineHeight: '24px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '36px'
            }
        ],
        '28': [
            '28px',
            {
                lineHeight: '40px'
            }
        ],
        '36': [
            '36px',
            {
                lineHeight: '36px'
            }
        ],
        '48': [
            '48px',
            {
                lineHeight: '48px'
            }
        ],
        '50': [
            '50px',
            {
                lineHeight: '50px'
            }
        ],
        '54': [
            '54px',
            {
                lineHeight: '68px'
            }
        ],
        '64': [
            '64px',
            {
                lineHeight: '80px'
            }
        ],
        '75': [
            '75px',
            {
                lineHeight: '75px'
            }
        ]
    },
    spacing: {
        '1': '2px',
        '12': '24px',
        '14': '28px',
        '24': '48px',
        '29': '58px',
        '40': '80px',
        '50': '100px',
        '53': '106px',
        '90': '180px',
        '15px': '15px'
    },
    borderRadius: {
        xs: '1px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '100px'
    },
    boxShadow: {
        md: 'rgba(140, 150, 158, 0.35) 3px 3px 5px 0px',
        lg: 'rgba(127, 137, 161, 0.25) 0px 0px 30px 0px'
    },
    screens: {
        '400px': '400px',
        sm: '426px',
        md: '769px',
        '890px': '890px',
        '897px': '897px',
        lg: '1024px',
        xl: '1280px',
        '1367px': '1367px'
    },
    transitionDuration: {
        '150': '0.15s',
        '300': '0.3s'
    },
    transitionTimingFunction: {
        default: 'ease',
        linear: 'linear'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '55%'
    }
},
  },
};
