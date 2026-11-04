# Tecnologia

| Camada             | Escolha                             |
| ------------------ | ----------------------------------- |
| Front              | Next.js (App Router) + React        |
| Estilo             | Panda CSS                           |
| Formulário         | React Hook Form + Valibot           |
| Estado de servidor | TanStack Query                      |
| Backend            | Supabase — Postgres, Auth, RLS, RPC |
| Gráficos           | barras em Panda — ver abaixo        |
| Imagem de tela     | `html-to-image` + Web Share API     |
| Testes             | Vitest + Testing Library            |
| Hospedagem         | pendente                            |
| IA                 | pendente                            |

Versões não são fixadas neste documento.

## Regras

- `supabase-js` é o cliente HTTP; o PostgREST expõe o CRUD a partir do schema.
- `app/api/` tem 2 rotas: `assistente` (chave secreta) e `backup` (Vercel Cron).
- Filtro, ordenação, paginação e agregação rodam no Postgres.
- Escrita que toca 2+ tabelas e envolve dinheiro é RPC transacional.
  As funções existentes estão em `supabase/migrations/`.
- Isolamento entre organizações é garantido por RLS, nunca por filtro no front.
- Panda é zero-runtime: estiliza Server Component sem `'use client'`.
- Valibot valida formulário e resposta do banco.
- **Gráfico é barra em Panda, não biblioteca (revisado na Fase 14).** Este
  documento fixava Recharts desde o começo, e ele nunca chegou a ser
  instalado. Quando a primeira tela de gráfico apareceu, o que ela pediu
  foram barras proporcionais (`height: valor/máximo`) — sem eixo calculado,
  curva, escala logarítmica ou tooltip rico. Recharts custaria ~100 KB,
  obrigaria `'use client'` em painéis que Panda renderiza no servidor de
  graça, e o resultado não bateria com o protótipo aprovado.
  Os componentes vivem em `features/relatorios/Relatorios/_components/`
  (`GraficoDiario`, e o sparkline dentro de `DetalheDaVariacao`); nenhum foi
  promovido ao design system, porque nenhum tem segundo consumidor ainda.
  **O trade-off tem prazo:** no dia em que uma tela pedir eixo temporal
  real, zoom ou seleção de faixa, uma biblioteca volta à mesa — para aquele
  gráfico, não para todos.
- Documento que sai do sistema como imagem (extrato, Fase 11) é fotografado
  do **mesmo nó DOM** que a pessoa acabou de ver, por `html-to-image`, e
  entregue por `navigator.share({ files })` com download como queda. Um
  segundo layout — canvas imperativo ou JSX de servidor — divergiria do
  primeiro só depois de a imagem já ter sido enviada. O import é dinâmico:
  a biblioteca só é baixada quando ela decide enviar.

## Não fazer

- Route Handler para CRUD.
- `select('*')` — listar colunas sempre.
- Baixar coleção inteira para filtrar ou somar no cliente.
- Supabase Edge Function.
- ORM.

## Hospedagem — pendente

Vercel Hobby não permite uso comercial. Decidir antes do primeiro cliente pagante.

| Opção                         | Custo/mês | Ops   |
| ----------------------------- | --------- | ----- |
| Vercel Pro                    | US$ 20    | zero  |
| Cloudflare Workers (OpenNext) | US$ 0     | baixa |
| Railway / Render / Fly        | ~US$ 5    | média |
| VPS                           | ~US$ 5    | alta  |

Timeout de serverless não é restrição: a agregação pesada roda no Postgres.

## Supabase — atenção

Free tier pausa o projeto após inatividade e não inclui backup automático.
Plano pago entra quando houver cliente pagante.
