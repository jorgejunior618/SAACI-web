import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'src/styled-system/**', 'design-system/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  // O tipo de queryOptions() carrega a chave por inferência: anotar o retorno o perde.
  {
    files: ['src/**/*.queries.ts'],
    rules: { '@typescript-eslint/explicit-module-boundary-types': 'off' },
  },
  // Feature fala só com a superfície pública de services/, nunca com o mock por trás dela.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/*/*'],
              message: 'Importe de @/services/<dominio>, não de um arquivo interno.',
            },
          ],
        },
      ],
    },
  },
  // Design system é UI pura: sem dado e sem rota (doc/design-system.md).
  {
    files: ['src/@design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/*', '@/features/*', 'next/navigation'],
              message: '@design-system é UI pura.',
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
