module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'dist/'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'max-len': ['error', { 'code': 120 }],
    'max-lines-per-function': ['error', { 'max': 50, 'skipBlankLines': true, 'skipComments': true }],
    'complexity': ['error', 10],
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'curly': 'error',
    'eqeqeq': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-duplicate-imports': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'default',
        'format': ['camelCase']
      },
      {
        'selector': 'variable',
        'format': ['camelCase', 'UPPER_CASE']
      },
      {
        'selector': 'parameter',
        'format': ['camelCase'],
        'leadingUnderscore': 'allow'
      },
      {
        'selector': 'typeLike',
        'format': ['PascalCase']
      },
      {
        'selector': 'interface',
        'format': ['PascalCase']
      },
      {
        'selector': 'enum',
        'format': ['PascalCase']
      },
      {
        'selector': 'enumMember',
        'format': ['UPPER_CASE']
      }
    ]
  },
};