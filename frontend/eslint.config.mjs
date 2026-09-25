// ESLint 9 flat config. Bridges Next's eslintrc-style shareable config
// (next/core-web-vitals) into flat config via FlatCompat.
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'dist/**'] },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // Literal quotes/apostrophes in JSX text render fine; this rule is
      // purely stylistic and the codebase uses natural punctuation.
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default config;
