const { FlatESLintConfig } = require('@eslint/eslintrc');

module.exports = [
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['*.js', '*.jsx'],
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
