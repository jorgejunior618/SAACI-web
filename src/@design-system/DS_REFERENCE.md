# DS_REFERENCE

Catálogo dos componentes de `@design-system`. Cada componente entra aqui no mesmo commit em que
nasce ou muda.

## Atoms

### Badge

- Uso: etiqueta curta de estado, 12px sobre `surface.muted`. Só a cor do texto diz o estado; o fundo é sempre o mesmo. Sem ícone, sem ação, não é botão. No máximo três palavras e nenhum quinto tom.
- Props: `tone?: 'neutral' | 'counts' | 'partial' | 'doesNotCount'` (padrão `neutral`), `children`, mais as props de `span`. A tradução do status de domínio ("conta", "parcial", "não conta") para `tone` é de quem usa.
- Medida: altura mínima de 20px. O protótipo pede 6px de padding lateral, que não existe na escala de 4px; o componente usa 4px.
- Galeria: `/design-system/badge`.

### Button

- Uso: dispara uma ação, 48px. `primary` é a ação da tela (uma por tela); `secondary` é ação paralela; `tertiary` é saída lateral; `danger` só em bottom sheet ou tela de confirmação. `disabled` só para ação impossível; campo vazio não desabilita.
- Props: `variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'`, `block?`, `busy?`, `busyLabel?` (gerúndio, padrão "Enviando"), `icon?: LucideIcon`, `children`, mais as props de `button`. `type` padrão é `button`.
- Estados: `busy` marca `aria-busy`, troca o conteúdo por `Spinner sm` e `busyLabel`, deixa de repassar o `onClick` e vira `type="button"` (não envia o formulário). Não usa `disabled`, então a cor não muda. Um `onClick` em elemento pai ainda dispara.
- Composição: importa `Icon` e `Spinner`.
- Galeria: `/design-system/button`.

### Card

- Uso: base dos cartões (CategoryCard, SuggestionCard, RulePanel). `surface`, borda de 1px em `line`, raio `card`, padding 16px, sem sombra. Sempre `display: block`, inclusive com `as="a"`.
- Props: `as?: ElementType` (`div` por padrão), `children`, e as props do elemento escolhido (`href` com `a`).
- Galeria: `/design-system/card`.

### Icon

- Uso: invólucro do `lucide-react` com traço de 1,5px e `currentColor`. Escondido de leitor de tela; o texto ao lado carrega o significado. Nunca sozinho, sem emoji.
- Props: `icon: LucideIcon`, `size?: 'sm' | 'md' | 'lg'` (16, 20 e 22px; padrão `md`).
- Galeria: `/design-system/icon`.

### Link

- Uso: link de texto em `brand.text`, sublinhado. Renderiza `<a>`; a feature passa o `Link` do `next/link` em `as` para navegar sem recarregar (o design system não importa o roteador).
- Props: `as?: ElementType`, `isStandalone?` (alvo de 48px, para link sozinho na linha), `children` e as props de `a`.
- Galeria: `/design-system/link`.

### ProgressBar

- Uso: progresso de horas, 4px, trilho `progress.track`. `role="progressbar"` com `aria-valuenow/min/max`. `value` é cortado entre 0 e `max`. O número ("4,0h de 20h") é texto de quem usa.
- Props: `value: number`, `max: number`, `label: string` (vira `aria-label`).
- Galeria: `/design-system/progress-bar`.

### Spinner

- Uso: carregamento. `sm` (16px) herda a cor do texto e vai dentro de botão ou linha; `lg` (32px) usa `redemoinho` com a ponta em `brand` e é só de tela inteira. `role="status"` com texto para leitor de tela.
- Props: `size?: 'sm' | 'lg'` (padrão `sm`), `label?: string` (padrão "Carregando"; use o gerúndio da ação).
- Medida: uma volta em 1,2s. O protótipo usa 0,8s, que parece rápido demais.
- Galeria: `/design-system/spinner`.

## Medidas sem token

`sizes` só tem `touch`, `control`, `topbar`, `bottomnav` e `content`. Estas medidas do desenho ficam em px no `recipe.ts` ou no `styles.ts` do componente: 16px e 32px do Spinner, 4px da ProgressBar e 20px do Badge.

## Galeria

Site de dev em `/design-system` (código em `src/features/design-system/Galeria/`), no lugar de um
Storybook. É página de desktop, com sidebar e uma página por seção (`/design-system/cores`,
`/design-system/button`), nos temas claro e escuro do sistema. Em produção toda a rota responde 404.

- Componente novo ou alterado ganha ou atualiza a sua página em `Galeria/sections.ts` no mesmo
  commit deste arquivo. A sidebar e a rota leem essa lista.
- Cada página mostra as variantes e os estados do componente e, quando há prop para mexer, um painel
  de controles (select, switch e deslizador, sem addon e sem dependência nova).

<!--
Formato de uma entrada:

### NomeDoComponente

- Uso: quando usar.
- Props: as principais, com o tipo.
-->
