# Tecnologia

| Camada             | Escolha                                     |
| ------------------ | ------------------------------------------- |
| Front              | Next.js (App Router) + React                |
| Estilo             | Panda CSS                                   |
| Formulário         | React Hook Form + Valibot                   |
| Estado de servidor | TanStack Query                              |
| Dados              | mock no localStorage, dentro de `services/` |
| Ícones             | lucide-react                                |
| Testes             | Vitest + Testing Library                    |
| Qualidade          | ESLint, Prettier, Husky, commitlint         |
| Ambiente           | Node 22 (`.nvmrc`) + pnpm                   |
| Backend            | pendente                                    |
| Hospedagem         | pendente                                    |

Versões não são fixadas aqui: a verdade é o `package.json`.

## Regras

- O front vem primeiro. Todo dado sai de um mock em `services/<dominio>/<dominio>.mock.ts`.
- O service devolve Promise como se houvesse rede, para a troca pelo backend não mudar a feature.
- Panda é zero-runtime: estiliza Server Component sem `'use client'`.
- Valibot valida formulário e o que sai do service.
