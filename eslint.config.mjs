import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * Flat config nativa de ESLint 9+.
 *
 * `eslint-config-next` 16 ya exporta arrays de flat config, así que no hace
 * falta el puente `FlatCompat` del formato antiguo.
 *
 * `eslint-config-prettier` va al final: su única función es desactivar las
 * reglas de estilo que colisionan con Prettier, y para eso debe ganar.
 */
/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts'],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    rules: {
      // Las variables sin usar rompen el lint, salvo prefijo `_` deliberado.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Un `console.log` olvidado es ruido en producción; warn/error sí valen.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  prettier,
];

export default eslintConfig;
