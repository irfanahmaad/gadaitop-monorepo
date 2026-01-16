import { config as baseConfig } from '@workspace/eslint-config/base';

/** @type {import("eslint").Linter.Config} */
export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    ignores: ['.prettierrc.mjs', 'eslint.config.mjs', 'dist/**'],
  },
];
