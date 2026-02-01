import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintPluginJest from 'eslint-plugin-jest'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.test.json',
      },
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: {
      jest: eslintPluginJest,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...eslintPluginJest.configs.recommended.rules,
    },
  },
  {
    ignores: ['node_modules', 'dist'],
  },
]
