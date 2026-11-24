import pluginQuery from '@tanstack/eslint-plugin-query'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import perfectionist from 'eslint-plugin-perfectionist'

// Ordem dos imports, em blocos separados por linha em branco: externos (react e next entram aqui),
// design system, alias `@/` e relativos (`../` e `./`), com `./styles` sempre por último. Dentro de
// cada bloco a ordem é alfabética pelo caminho, e imports de tipo e de valor andam juntos.
const importGroups = [
  ['builtin', 'external'],
  'design-system',
  'internal',
  ['parent', 'sibling', 'index'],
  { newlinesBetween: 0 },
  'styles',
  'unknown',
]

const importCustomGroups = [
  { groupName: 'design-system', elementNamePattern: '^@design-system' },
  { groupName: 'styles', elementNamePattern: '^\\./styles$' },
]

// Cabeçalho de licença de todo arquivo de src/ (CONTRIBUTING.md, "Cabeçalho de licença"). Regra
// local e não plugin: são poucas linhas, e o `--fix` do lint-staged insere o cabeçalho no commit.
// Cabeçalho que começa com SPDX mas tem outro texto não é corrigido sozinho, para não duplicar.
const licenseHeader = [
  '// SPDX-License-Identifier: AGPL-3.0-only',
  '// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.',
].join('\n')

const saaciPlugin = {
  rules: {
    'license-header': {
      meta: {
        type: 'problem',
        fixable: 'code',
        schema: [],
        messages: {
          missing: 'Falta o cabeçalho de licença. Rode `pnpm lint:fix` para inserir.',
          different:
            'Cabeçalho de licença diferente do modelo do CONTRIBUTING.md. Troque pelas duas linhas do modelo.',
        },
      },
      create(context) {
        return {
          Program() {
            const text = context.sourceCode.getText()
            if (text.startsWith(licenseHeader)) return
            const loc = { line: 1, column: 0 }
            if (text.startsWith('// SPDX-License-Identifier')) {
              context.report({ loc, messageId: 'different' })
              return
            }
            context.report({
              loc,
              messageId: 'missing',
              fix: (fixer) => fixer.insertTextBeforeRange([0, 0], `${licenseHeader}\n\n`),
            })
          },
        }
      },
    },
  },
}

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'src/styled-system/**',
      // Gerado por `pnpm db:types`.
      'src/@supabase/database.types.ts',
      // Edge Functions rodam em Deno (`npm:`, `Deno.serve`), fora das regras e dos tipos do app.
      'supabase/functions/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  // Chave de query completa, QueryClient estável e ordem das propriedades (doc/react-query.md).
  ...pluginQuery.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      // Prefixo `_` marca o que é ignorado de propósito.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Cabeçalho de licença. O código gerado já está nos `ignores` globais.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { saaci: saaciPlugin },
    rules: { 'saaci/license-header': 'error' },
  },
  // Ordem dos imports e dos nomes importados. Corrige sozinho com `pnpm lint:fix`.
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts'],
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          newlinesBetween: 1,
          groups: importGroups,
          customGroups: importCustomGroups,
        },
      ],
      'perfectionist/sort-named-imports': ['error', { type: 'alphabetical' }],
    },
  },
  // O tipo de queryOptions() carrega a chave por inferência: anotar o retorno o perde.
  {
    files: ['src/**/*.queries.ts'],
    rules: { '@typescript-eslint/explicit-module-boundary-types': 'off' },
  },
  // Feature fala só com a superfície pública de services/, nunca com o mock por trás dela, e nunca
  // com o Supabase (`@supabase/*` cobre os clientes do projeto e os pacotes npm do mesmo escopo).
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
            {
              group: ['@supabase/*'],
              message: 'Tela não importa o Supabase: fale com @/services/<dominio>.',
            },
          ],
        },
      ],
    },
  },
  // Teste de tela monta o estado pela função de exemplo do mock do domínio (`doc/testes.md`), então
  // pode importar o mock. A regra do Supabase continua valendo.
  {
    files: ['src/features/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*'],
              message: 'Tela não importa o Supabase: fale com @/services/<dominio>.',
            },
          ],
        },
      ],
    },
  },
  // Componente compartilhado com lógica também fala só com services/, nunca com o Supabase.
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*'],
              message: 'Componente não importa o Supabase: fale com @/services/<dominio>.',
            },
          ],
        },
      ],
    },
  },
  // Arquivo interno de um domínio não importa o próprio index.ts (risco de ciclo). Usa `paths` e não
  // `patterns`: `patterns` casa por segmento e o padrão `.` pegaria qualquer import relativo.
  {
    files: ['src/services/*/*.ts'],
    ignores: ['src/services/*/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '.',
              message:
                'Arquivo interno do domínio não importa do próprio index.ts: importe do irmão.',
            },
            {
              name: './index',
              message:
                'Arquivo interno do domínio não importa do próprio index.ts: importe do irmão.',
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
            {
              group: ['@supabase/*'],
              message: '@design-system é UI pura: não importa o Supabase.',
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
