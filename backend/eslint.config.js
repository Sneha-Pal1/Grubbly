export default [
  {
    files: ['**/*.js'], //only checks js file in backend directory
    rules: {
      semi: 'error', //force semicolons
      'no-unused-vars': 'warn', //warn if variables are unused
    },
  },
];
