import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    '.next/**',
    '.yarn/**',
    'node_modules/**',
    'public/**',
    'coverage/**',
    '@types/**',
    'storybook-static/**',
  ]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { unicorn },
    rules: {
      // These rules are stricter React 19/compiler-era checks than the
      // existing React 18 product was authored against. Keep them opt-in
      // while retaining the modern Next.js 16 parser and core checks.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['*.config.js', 'next-sitemap.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
]);
