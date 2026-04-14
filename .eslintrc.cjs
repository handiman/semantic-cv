module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  globals: {
    NodeJS: 'readonly',
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-control-regex': 'off', // Allow control characters in regex
    'no-useless-escape': 'off', // Allow unnecessary escapes
    'no-constant-condition': 'off', // Allow constant conditions in tests
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};