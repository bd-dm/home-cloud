module.exports = {
  root: true,
  extends: '@react-native-community',
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'ESNext',
        project: ['tsconfig.json'],
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/consistent-type-exports': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
  ],
};
