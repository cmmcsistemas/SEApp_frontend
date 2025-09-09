module.exports = {
  plugins: {
    // Autoprefixer adds vendor prefixes to CSS rules
    autoprefixer: {},
    // Tailwind CSS as a PostCSS plugin
    tailwindcss: {},
    // Example of another plugin with options
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
      },
    },
  },
};
