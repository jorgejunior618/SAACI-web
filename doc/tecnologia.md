# Tecnologia

| Camada             | Escolha                                                       | Por quê                                                                                                                                                                                                        | Descartado                               |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Front              | Next.js (App Router) + React                                  | Server Component com prefetch corta uma viagem de rede na entrada de cada tela, e a meta é 3 s em mobile (RNF14)                                                                                               | SPA só no cliente                        |
| Estrutura          | `app/` fino + `features/` + `services/`                       | Componente não fica preso à convenção de arquivos do Next                                                                                                                                                      | Co-location dentro de `app/`             |
| Estilo             | Panda CSS, só com `preset-base`                               | Zero runtime e funciona em Server Component sem `'use client'`. Valor fora dos tokens do SAACI nem tem nome                                                                                                    | Tailwind; CSS-in-JS com runtime          |
| Fonte              | Geist via `next/font`                                         | O design depende dela nos números grandes. Servida pelo próprio site, sem chamada ao Google em uso                                                                                                             | Fonte de sistema                         |
| Formulário         | React Hook Form + Valibot                                     | Bundle menor com a mesma ideia de schema como fonte do tipo, o que ajuda na meta de RNF14                                                                                                                      | Zod                                      |
| Estado de servidor | TanStack Query                                                | Cache e invalidação não dependem de rede. Painel, resumo e formulário leem e invalidam juntos                                                                                                                  | Busca só no cliente                      |
| Backend            | Supabase: Postgres, Auth, Storage, RLS, RPC                   | Auth, Storage, RLS e Postgres no mesmo serviço cobrem RF01 a RF08, RNF04 e RNF24 sem API própria; o PostgREST já expõe o schema                                                                                | API própria de CRUD; ORM                 |
| Dados hoje         | mock em memória, dentro de `services/`                        | Sem persistência: recarregar volta ao estado inicial. Cada domínio troca o mock pelo Supabase de uma vez                                                                                                       | `localStorage`                           |
| Ícones             | lucide-react                                                  | Evita desenhar ícone à mão; o projeto é aberto                                                                                                                                                                 | Ícones em SVG próprios                   |
| Testes             | Vitest + Testing Library                                      | Mais rápido que Jest, com API equivalente                                                                                                                                                                      | Jest                                     |
| Qualidade          | ESLint, Prettier, Husky, commitlint                           | Formatação e mensagem de commit conferidas no hook, sem depender de revisão manual. O ESLint trava as fronteiras de importação, porque regra escrita só em documento não segura contribuidor de projeto aberto | Só convenção em documento                |
| Ambiente           | Node 22 (`.nvmrc`) + pnpm                                     | O Vitest 5 exige Node 22.12 ou maior                                                                                                                                                                           | npm                                      |
| Linguagem          | TypeScript 6, não 7                                           | `typescript-eslint` não suporta TS 7 ainda                                                                                                                                                                     | TypeScript 7                             |
| Versão e release   | Semver por tag `vX.Y.Z` e GitHub Release, por workflow manual | A versão sai dos Conventional Commits por um script próprio, sem pacote. A `main` bloqueia push, então o Release é o changelog (ADR 0022)                                                                      | release-please; versão no `package.json` |
| Hospedagem         | Vercel, plano Hobby                                           | Roda Next 16 sem adaptador e cria preview por PR. A função comporta os 18 s da leitura do Gemini. Só para uso não comercial (ADR 0019)                                                                         | Netlify; Cloudflare com OpenNext         |
| E-mail do Auth     | Brevo, plano gratuito, por SMTP                               | O SMTP padrão do Supabase trava o cadastro. A Brevo não exige domínio próprio (ADR 0019)                                                                                                                       | Resend; Gmail com senha de app           |
| IA (RF41)          | Gemini Flash, camada gratuita, em Route Handler               | Custo zero e sem SDK. Limite de 10 leituras por aluno por dia (ADR 0016). Envio do comprovante ao Google aprovado pelo time (RNF26)                                                                            | Haiku 5.5; Gemini pago; Tesseract        |

Versões não são fixadas aqui: a verdade é o `package.json`.

## Regras

- O front vem primeiro. Todo dado sai de um mock em `services/<dominio>/<dominio>.mock.ts`.
- O service devolve Promise como se houvesse rede, para a troca pelo Supabase não mudar a feature.
- Alvo: `supabase-js` é o cliente HTTP; o PostgREST expõe o CRUD a partir do schema.
- Alvo: `app/api/` só para segredo (chave do serviço de IA, `service_role`) e para agendamento.
- Alvo: filtro, ordenação, paginação e agregação rodam no Postgres.
- Alvo: escrita que toca 2+ tabelas, ou tabela e arquivo, é RPC transacional. As funções existentes
  estarão em `supabase/migrations/`.
- Alvo: isolamento entre alunos é garantido por RLS, nunca por filtro no front (RNF04).
- Panda é zero-runtime: estiliza Server Component sem `'use client'`.
- Valibot valida formulário e o que sai do service.
- **Barra de progresso é Panda, não biblioteca de gráfico.** Nenhum requisito do MVP pede gráfico: a
  tela pede barras proporcionais (`largura: valor/máximo`), sem eixo calculado, curva, escala ou
  tooltip. Uma biblioteca de gráfico custaria uns 100 KB, obrigaria `'use client'` em telas que o
  Panda renderiza no servidor de graça, e o resultado não bateria com o desenho aprovado. O
  `ProgressBar` está no design system. **O trade-off tem prazo:** no dia em que uma tela pedir eixo
  temporal real, zoom ou seleção de faixa, uma biblioteca volta à mesa, para aquele gráfico e não
  para todos.
- Documento que sai do sistema como arquivo (o `.zip` do RF36, o formulário do RF37) é montado a
  partir dos **mesmos dados** que a pessoa acabou de ver. Um segundo cálculo para o arquivo divergiria
  do primeiro só depois de o arquivo já ter sido enviado à coordenação. A biblioteca de compactação
  só entra quando a tela do RF36 for construída, com import dinâmico.

## Não fazer

- Route Handler para CRUD.
- `select('*')`: listar colunas sempre.
- Baixar coleção inteira para filtrar ou somar no cliente.
- ORM.
- Biblioteca de gráfico, de ícones ou de componentes sem requisito que a peça.
- Guardar dado do aluno em `localStorage` fora do mock.

## Supabase: atenção

> Alvo (Supabase): ainda não implementado.

O free tier pausa o projeto após inatividade e não inclui backup automático. Para um sistema que
promete disponibilidade no horário letivo (RNF19) e guarda comprovantes, o plano e a retenção de
backup se decidem antes de o primeiro aluno real usar. Os números ficam a decidir.
