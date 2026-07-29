/**
 * skateAF — Tailwind preset (the design tokens)
 * ---------------------------------------------
 * Constructivist agitprop for skate culture. Red, black, newsprint, gold.
 * Import this into any consumer's tailwind.config to get the whole vocabulary:
 *
 *   module.exports = { presets: [require('skateaf/preset')], content: [...] }
 *
 * Every color/space/font token here is the on-brand vocabulary. Use these
 * names, not raw hex values.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    // Sharp by default — constructivism has no soft corners.
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      sm: '2px',
      md: '4px',
      full: '9999px',
    },
    extend: {
      colors: {
        // Base surfaces
        void: '#0B0B0B', // near-black ink / base
        ink: '#111111', // text on light
        paper: '#F4EFE3', // warm newsprint cream
        // Revolutionary red — the flag
        flag: {
          50: '#FEECEA',
          100: '#FCCFC9',
          200: '#F79A8E',
          300: '#F16455',
          400: '#EC3A26',
          DEFAULT: '#E01B1B',
          500: '#E01B1B',
          600: '#C11414',
          700: '#9A0F0F',
          800: '#6E0B0B',
          900: '#450808',
        },
        // Deep red, only for hard-shadow depth under red elements
        blood: '#7A0C0C',
        // Sun gold — warm, celebratory secondary (red-star gold, but happy)
        gold: {
          DEFAULT: '#FFC831',
          400: '#FFD85E',
          500: '#FFC831',
          600: '#E9A80F',
        },
        // Paradise sky — bright optimistic blue. The future is sunny.
        sky: {
          DEFAULT: '#22B4E6',
          400: '#5CCBF0',
          500: '#22B4E6',
          600: '#0E8FC0',
        },
        // Palm — lush green. Grass under the coping, endless summer.
        palm: {
          DEFAULT: '#22B573',
          400: '#4FCB93',
          500: '#22B573',
          600: '#158A56',
        },
        // Concrete — asphalt grays for structure
        concrete: {
          50: '#EDEBE6',
          100: '#D8D5CE',
          200: '#B7B3AA',
          300: '#928E85',
          400: '#6E6A62',
          500: '#4C4842',
          600: '#33302B',
          700: '#242220',
          800: '#171614',
          900: '#0D0C0B',
        },
      },
      fontFamily: {
        // Loud condensed display — headlines, slogans, banners.
        display: ['Oswald', '"Arial Narrow"', '"Helvetica Neue Condensed"', 'sans-serif'],
        // Heavy slab poster type — big agitprop statements.
        poster: ['"Archivo Black"', 'Impact', '"Arial Black"', 'sans-serif'],
        // Body grotesque — readable UI text.
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        // Manifesto mono — labels, meta, terminal energy.
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Named type scale
        micro: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.12em' }],
        meta: ['0.8125rem', { lineHeight: '1.2', letterSpacing: '0.06em' }],
        body: ['1rem', { lineHeight: '1.55' }],
        lede: ['1.25rem', { lineHeight: '1.45' }],
        h3: ['1.75rem', { lineHeight: '1.05' }],
        h2: ['2.75rem', { lineHeight: '0.98' }],
        h1: ['4rem', { lineHeight: '0.92' }],
        display: ['6rem', { lineHeight: '0.86', letterSpacing: '-0.01em' }],
      },
      spacing: {
        // Named 4px scale used across the system
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        '2xl': '64px',
        '3xl': '96px',
      },
      borderWidth: {
        DEFAULT: '2px',
        3: '3px',
        4: '4px',
        6: '6px',
      },
      boxShadow: {
        // Hard, blur-less offsets — sticker-slap / poster paste-up.
        hard: '4px 4px 0 0 #0B0B0B',
        'hard-lg': '8px 8px 0 0 #0B0B0B',
        'hard-flag': '4px 4px 0 0 #E01B1B',
        'hard-gold': '4px 4px 0 0 #F2C230',
      },
      letterSpacing: {
        slogan: '0.06em',
        stamp: '0.18em',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'slap-in': {
          '0%': { transform: 'scale(0.6) rotate(-8deg)', opacity: '0' },
          '70%': { transform: 'scale(1.06) rotate(-2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-2deg)', opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        'marquee-fast': 'marquee 12s linear infinite',
        'slap-in': 'slap-in 260ms cubic-bezier(0.2, 1.4, 0.4, 1) both',
      },
    },
  },
  plugins: [],
};
