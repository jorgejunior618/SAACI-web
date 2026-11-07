# DS_REFERENCE

Catálogo dos componentes de `@design-system`. Cada componente entra aqui no mesmo commit em que
nasce ou muda.

## Button (atom)

- Uso: dispara uma ação, 48px. `primary` é a ação da tela (uma por tela); `secondary` é ação paralela; `tertiary` é saída lateral; `danger` só em bottom sheet ou tela de confirmação. `disabled` só para ação impossível; campo vazio não desabilita.
- Props: `variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'`, `block?`, `busy?`, `busyLabel?` (gerúndio, padrão "Enviando"), `icon?: LucideIcon`, `children`, mais as props nativas de `button`. `type` padrão é `button`.
- Estados: `busy` marca `aria-busy`, troca o conteúdo por `Spinner sm` e `busyLabel` e deixa de repassar o `onClick` sem usar `disabled` e vira `type="button"` (não envia o formulário).
- Galeria: `/design-system/button`.

## Link (atom)

- Uso: link de texto em `brand.text`, sublinhado. Renderiza `<a>`; a feature passa o `Link` do `next/link` em `as` para navegar sem recarregar (o design system não importa o roteador).
- Props: `as?: ElementType`, `isStandalone?` (alvo de 48px, para link sozinho na linha), `children` e as props de `a`.
- Galeria: `/design-system/link`.

## Card (atom)

- Uso: base dos cartões (CategoryCard, SuggestionCard, RulePanel). `surface`, borda de 1px em `line`, raio `card`, padding 16px, sem sombra.
- Props: `as?: ElementType` (`div` por padrão), `children` e as props de `div`.
- Galeria: `/design-system/card`.

## Icon (atom)

- Uso: invólucro do `lucide-react` com traço de 1,5px e `currentColor`. Escondido de leitor de tela; o texto ao lado carrega o significado. Nunca sozinho, sem emoji.
- Props: `icon: LucideIcon`, `size?: 'sm' | 'md' | 'lg'` (16, 20 e 22px; padrão `md`).
- Galeria: `/design-system/icon`.

## Spinner (atom)

- Uso: carregamento. `sm` (16px) herda a cor do texto e vai dentro de botão ou linha; `lg` (32px) usa `redemoinho` com a ponta em `brand` e é só de tela inteira. `role="status"` com texto para leitor de tela.
- Props: `size?: 'sm' | 'lg'` (padrão `sm`), `label?: string` (padrão "Carregando"; use o gerúndio da ação).
- Galeria: `/design-system/spinner`.

## ProgressBar (atom)

- Uso: progresso de horas, 4px, trilho `progress.track`. `role="progressbar"` com `aria-valuenow/min/max`. `value` é cortado entre 0 e `max`. O número ("4,0h de 20h") é texto de quem usa.
- Props: `value: number`, `max: number`, `label: string` (vira `aria-label`).
- Galeria: `/design-system/progress-bar`.

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
