# Design system SAACI: instruções para o Claude Code

Esta pasta é a **fonte da verdade visual e de comportamento** do app SAACI. Ao gerar ou alterar qualquer interface, siga o que está aqui.

## Leia nesta ordem
1. `README.md`: visão geral e as 10 regras de ouro.
2. `tokens/tokens.json`: todos os valores, cada um com o campo `usage` dizendo onde ele pode ser usado.
3. `docs/fundamentos.md`: cor, tipografia, espaço, ícones, movimento, acessibilidade, voz.
4. `docs/componentes.md`: o catálogo. Cada componente do código deve corresponder a um item daqui.
5. `docs/telas-e-fluxos.md`: rotas, telas, estados e textos exatos.
6. `docs/regras-de-negocio.md`: cálculo de horas, limites e status.
7. `reference/prototipos/*.html`: o protótipo original, para tirar dúvidas de layout. Está no formato do editor de design (`<x-dc>`, `<sc-if>`, `<sc-for>`, `{{variável}}`, `renderVals()`). **Leia como especificação, não copie esse formato para o app.**

## Regras obrigatórias
- **Nunca use cor, tamanho, espaço ou raio literal** no código de UI. Use os tokens (`var(--brand)`, `var(--space-4)`…) ou as classes do preset do Tailwind, se o projeto usar Tailwind.
- Carregue `tokens/tokens.css` antes de tudo. `css/saaci.css` pode ser importado inteiro ou servir de referência para estilizar os componentes do framework, mas o resultado visual tem de ser idêntico.
- Respeite os papéis das cores descritos em `usage`: `brand-soft` só para opção marcada, `ink-subtle` nunca para texto de leitura, `danger-fill` só em botão destrutivo, `gorro` e `redemoinho` nunca em componentes.
- Sem sombra no fluxo da página. Só bottom sheet e diálogo levam `--shadow-overlay`.
- Uma ação primária por tela.
- Todo texto da interface em **português do Brasil**, usando os textos de `docs/telas-e-fluxos.md` como base. Horas com vírgula decimal (`10,0h`), números com `tabular-nums`.
- Suporte a tema claro, escuro e automático desde a primeira tela (`data-theme` no `<html>`, ou nada para seguir o sistema).
- Acessibilidade como no catálogo: elementos nativos, `label` em todo campo, `aria-current` na aba ativa, `role="progressbar"` no total, `role="status"`/`role="alert"` nas mensagens, foco visível, alvos ≥ 48px, `prefers-reduced-motion`.
- Ícones: Lucide (ou SVG de traço 1.5px equivalente). Nunca emoji.
- Mobile-first: layout de 390px de referência; em telas largas, centralizar a coluna com `max-width: var(--content-max)`.
- Cada tela deve implementar **todos os estados** listados em `docs/telas-e-fluxos.md` (vazio, carregando, erro, sucesso…), não só o caminho feliz.
- Se um dado real não existir (prazo, URL, texto legal), deixe um marcador visível como `[PRAZO DO RNF05]` em vez de inventar.

## Ordem sugerida para gerar o código-base
1. Tokens e estilos globais (fonte Geist, tema, reset).
2. Componentes base: Button, IconButton, Link, TextField, ChoiceGroup, SegmentedControl, ProgressBar, StatusBadge, Notice, InlineMessage, Spinner/Status, Card.
3. Estrutura: Screen, TopBar (4 variantes), BottomNav (com botão central), ActionFooter, ConfirmSheet, EmptyState.
4. Componentes de domínio: TotalCard, CategoryCard, RulePanel, CalcTable, ActivityList, Disclosure, ItemPicker, SuggestionCard, Upload, FileRow, Checklist, Steps, PasswordRules, SettingsGroup, DataList.
5. Lógica de horas (`docs/regras-de-negocio.md`) como funções puras e testadas, separadas da UI.
6. Telas na ordem dos fluxos: Acesso → Seu curso → Início → Registrar → Atividades → Detalhe → Formulário → Perfil → Eventos.
7. Uma página interna `/design-system` (só em desenvolvimento) mostrando cada componente em cada estado, nos dois temas, para conferir com o protótipo.

---

## Como usar com o Claude Code

Copie a pasta `design-system/` para a raiz do repositório e, no `CLAUDE.md` da raiz, acrescente:

```md
## Design system
A interface segue o design system em `design-system/`. Antes de criar ou alterar UI, leia `design-system/CLAUDE.md` e siga suas regras.
```

Exemplo de pedido para gerar a base:

> Leia `design-system/CLAUDE.md` e todos os documentos que ele indica. Gere o código-base do app SAACI em **[sua stack, ex.: React + Vite + TypeScript]**: tokens e tema (claro/escuro/automático), a biblioteca de componentes do catálogo, a lógica de cálculo de horas com testes, e as telas do fluxo Início e do fluxo Registrar com todos os estados, usando os dados de exemplo de `docs/telas-e-fluxos.md`. Inclua uma página `/design-system` para conferir os componentes.
