# 0005. Componente usado por várias telas do mesmo domínio mora em `features/<dominio>/_components/`

- **Status:** Aceita
- **Data:** 11/11/2026

## Contexto

As telas de Acesso (Entrar, Criar conta, Confirme seu e-mail, Recuperar senha, Nova senha) repetem
três peças: o cartão do logo, a lista de regras da senha e o aviso de link vencido. Hoje só há dois
destinos: `_components/` de uma tela (uma tela só) ou `@design-system` (catálogo validado pela
equipe). Estas peças não são de uma tela só e não estão no catálogo. Sem decisão, cada tela copiaria
o componente, e a regra da senha teria cinco versões.

## Decisão

- Componente usado por duas ou mais telas do **mesmo domínio**, sem lógica de outro domínio e fora do
  catálogo do DS, mora em `features/<dominio>/_components/<Componente>/`, com `index.tsx` e
  `styles.ts`.
- Só telas do próprio domínio importam esse `_components/`. Outro domínio que precise do mesmo
  componente segue a promoção de `doc/design-system.md`.
- A regra "máximo 2 níveis dentro de um domínio" passa a valer para `<dominio>/<Tela>/` e para
  `<dominio>/_components/`.
- Exceção de design registrada: no `AccessHeader` de tamanho `sm`, o Voltar é só ícone, com
  `aria-label` e alvo de 48px, porque o título vem logo abaixo. A exceção vale só dentro do domínio
  Acesso.

## Consequências

- Uma regra da senha, um logo e um aviso de link vencido, cada um com um dono só.
- Mais uma pasta a conhecer. As perguntas 2 e 3 de `.claude/references/promocao-componente.md`
  passam a ter este destino intermediário.
- Se um segundo domínio precisar do componente, ele sobe para `components/` ou `@design-system` e a
  pasta local some.
- Obrigação de quem contribui: não importar o `_components/` de outro domínio.

## Alternativas descartadas

- Promover ao `@design-system`: as peças não estão no catálogo validado, e só entra o que a equipe
  especificou.
- Copiar em cada tela: cópia não é aceita, e a regra da senha divergiria.
- `components/` global: é para componente com lógica usado em 2+ telas de domínios diferentes.
