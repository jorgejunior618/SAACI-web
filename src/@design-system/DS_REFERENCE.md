# DS_REFERENCE

Catálogo dos componentes de `@design-system`. Cada componente entra aqui no mesmo commit em que
nasce ou muda.

Nenhum componente ainda.

## Galeria

Site de dev em `/design-system` (código em `src/features/design-system/Galeria/`), no lugar de um
Storybook. É página de desktop, com sidebar e uma página por seção (`/design-system/cores`,
`/design-system/button`), nos temas claro e escuro do sistema. Em produção toda a rota responde 404.

- Componente novo ou alterado ganha ou atualiza a sua página em `Galeria/sections.ts` no mesmo
  commit deste arquivo. A sidebar e a rota leem essa lista.
- Cada página mostra as variantes e os estados do componente e, a partir dos primitivos, um painel
  de controles das props (select e switch, sem addon e sem dependência nova).

<!--
Formato de uma entrada:

## NomeDoComponente (nível)

- Uso: quando usar.
- Props: as principais, com o tipo.
-->
