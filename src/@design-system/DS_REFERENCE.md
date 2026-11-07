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
- Props: `icon: LucideIcon`, `size?: 'sm' | 'md' | 'lg' | 'xl'` (16, 20, 22 e 32px; padrão `md`). O `xl` é só a arte da tela de estado.
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

## Molecules

### TextField

- Uso: campo de texto com rótulo sempre visível e a regra logo abaixo. Ordem fixa: rótulo, `hint`, erro, campo; o erro fica antes do campo para o leitor de tela ouvir primeiro. Campo de 48px, borda 1px `line.strong`, texto de 16px (evita zoom no celular). Obrigatório não leva asterisco; opcional escreve "(opcional)" no rótulo. Não limpa o campo após um erro.
- Props: `label`, `hint?`, `error?`, `optional?`, `status?: 'read' | 'unread'`, mais as props de `input` (`type`, `inputMode`, `ref`). `ref` vai como prop (React 19), então funciona com o `register` do React Hook Form.
- Estados: `error` usa borda `danger` mais grossa e mensagem em `danger`, sem ícone e sem fundo, e liga `aria-invalid`. `read` pinta o campo de `surface.muted` e escreve "Lido do certificado, confira" à direita do rótulo. `unread` deixa o campo vazio com borda tracejada `warning` e mostra `unreadMessage`, obrigatório nesse estado (o tipo recusa `unread` sem a frase), dizendo o que digitar. `error` tem prioridade: com ele o selo de leitura não aparece. `aria-describedby` junta regra, erro e selo.
- Senha: o mesmo componente com `type="password"`. O botão Mostrar/Ocultar (alvo de 48px, `aria-pressed`) aparece sozinho; não há prop `action` nem `PasswordField`.
- Fora do componente: validação (Valibot, na tela) e máscara de data e horas (regra de domínio, na tela).
- Galeria: `/design-system/text-field`.

### TopBar

- Uso: barra no topo, 56px (`sizes.topbar`) mais a área segura de cima, no creme do fundo (`surface.sunken`), **sem borda parada e sem sombra**. `home` mostra o símbolo (24px, `/logo-simbolo.png` via `next/image`, `alt` vazio), "SAACI" em `brand.text`, Perfil e Sair. `inner` mostra Voltar e o título em `h1`, 16px peso 500, com reticências se for longo. Telas da barra inferior não têm Voltar.
- Props, união por `variant`: `home` pede `profileHref` e `onSignOut`; `inner` pede `title` e aceita `backHref` **ou** `onBack` (os dois juntos o tipo recusa; nenhum dos dois, sem Voltar). `linkAs?` (como `Link.as`) troca o `<a>` pelo `Link` do `next/link`.
- Exceção de ícone: Voltar e Perfil aparecem só com ícone, cada um com `aria-label` ("Voltar", "Perfil") e alvo de 48px. É a única exceção a "ícone nunca sozinho" (`doc/design-system.md`); Sair é sempre texto.
- Borda ao rolar: uma linha de 1px em `line` (`::after`) com a animação `edgeIn` ligada à rolagem por `animation-timeline: scroll()`, sem JavaScript, em `@supports`. Parado, sem borda. O `scroll()` segue o rolador mais próximo (a página numa tela, a janela na galeria). Navegador sem o recurso fica sem a linha. Com `prefers-reduced-motion` a duração fixa da regra global é trocada por `auto`, para a linha seguir a rolagem.
- Galeria: `/design-system/top-bar`.

### BottomSheet

- Uso: painel que sobe da base para confirmar uma ação que apaga algo, sem sair da tela. Véu `scrim` e painel em `surface.raised`, cantos de cima `card` e `shadow.overlay`: é o **único** componente com sombra. Alça, título em forma de pergunta (`title`), a consequência em `support` e as ações empilhadas em largura total, 24px abaixo do texto: a destrutiva (`Button danger block`) e a de manter (`Button secondary block`). "Manter" ou "Cancelar", nunca "Não". Apagar a conta usa tela própria com confirmação por senha, não um sheet.
- Props: `ref` (`BottomSheetHandle` com `open()` e `close()`), `title`, `description`, `actions` (ReactNode, os botões vêm da tela), `returnFocusRef?` e `onClose?`. Não há prop `open`: a tela guarda um `useRef<BottomSheetHandle>(null)`, chama `ref.current?.open()` no gatilho e `ref.current?.close()` nos botões do sheet. `onClose` roda depois de qualquer fechamento e não diz qual foi.
- Acessibilidade: `<dialog>` nativo aberto com `showModal()`, `aria-modal`, `aria-labelledby` no título e `aria-describedby` na consequência. O fundo fica inerte e o foco não escapa do painel. O foco vai para o título ao abrir e volta, ao fechar, para `returnFocusRef` ou para quem tinha o foco ao abrir. Todo fechamento (Esc, toque no véu, Voltar do aparelho, `close()`) passa pelo evento `close` do `<dialog>`, e é ali que o foco volta e a rolagem do corpo é destravada. Sem `useEffect`; se a tela desmontar com o sheet aberto, um callback ref estável destrava a rolagem.
- Movimento: sobe da base por `transform` (`sheetIn`, `durations.fast`, `easings.out`). Com `prefers-reduced-motion` o painel só aparece.
- Testes: o jsdom não implementa `showModal` e `close`; o `vitest.setup.ts` tem um stub que liga e desliga `open`, dispara `close` e fecha no `cancel` sem `preventDefault`. Foco preso e fundo inerte são do navegador e não são testados.
- Medida: alça de 36 por 4px e altura máxima de 90dvh (o resto rola dentro do painel) ficam em px no `styles.ts`.
- Galeria: `/design-system/bottom-sheet`.

### ChoiceGroup

- Uso: escolha entre poucas opções (até 5) numa lista única, com o efeito de cada uma escrito embaixo. `fieldset` com `legend` em forma de pergunta; cada opção é um `label` com o `input` dentro, então a linha inteira é tocável (mínimo 48px, controle de 18px). A opção de rádio marcada ganha fundo `brand.soft`, o único fundo tingido do sistema. A linha de efeito ("Conta metade") fica sempre visível. Nada vem marcado de início. Mais de 5 opções, ou com número e regra, pedem o ItemPicker.
- Props, radio (padrão): `legend`, `name`, `options: { value, label, effect? }[]`, `value?` (`null` ou ausente deixa tudo desmarcado), `onChange(value)`, `error?`. Genérico no tipo do `value`.
- Props, `variant="single"`: `label`, `checked`, `onChange(checked)`, `name?`. É um checkbox isolado, num cartão próprio e sem fundo tingido. Grupo de vários checkboxes não existe no catálogo.
- Estados: controlado. O `error` aparece entre a pergunta e a lista e é ligado ao `fieldset` por `aria-describedby`.
- Galeria: `/design-system/choice-group`.

### FileUpload

- Uso: anexa o comprovante por foto ou arquivo. Rótulo, `hint` com formatos, limite e dica de frente e verso, e uma área tracejada com `Tirar foto` e `Escolher arquivo` (`secondary`, lado a lado). A linha sobre a leitura por IA, com o link de privacidade, é obrigatória e o texto é da tela (`notice` e `privacyLinkLabel` são props obrigatórias, então o tipo impede de esquecê-la). Depois de anexar, um `Card` mostra o ícone, o nome truncado (o nome inteiro fica no `title`), o tamanho e `Trocar`; a dica e a linha da IA saem.
- Props: `label`, `hint`, `accept: string[]` (tipos MIME), `maxSizeMb`, `file?`, `error?`, `onSelect(file)`, `onReplace()`, `notice`, `privacyLinkLabel`, `privacyHref`, `privacyLinkAs?`.
- Conferência: tipo, tamanho e arquivo vazio são recusados no próprio componente, com uma frase de motivo e próximo passo em `danger` (`role="alert"`) e sem chamar `onSelect`. É ajuda na hora, não segurança. O `error` da tela vence o do componente; no envio que caiu, `file` continua e a frase diz que o arquivo segue anexado.
- Fora do componente: enviar e ler o arquivo (`services/`). O componente só devolve o `File`.
- Câmera: `Tirar foto` usa `capture="environment"`. No desktop o navegador ignora e abre o seletor comum; os dois botões aparecem sempre. Não há arrastar e soltar.
- Galeria: `/design-system/file-upload`.

### Notice

- Uso: aviso dentro da tela, com o que aconteceu e o que fazer a seguir. `format="inline"` (padrão) é uma frase `p` colada ao que comenta, só com a cor do texto do tom, sem caixa e sem ícone. `format="block"` é um `div` em `surface` sobre o creme (`inCard` troca para `surface.muted` dentro de cartão), raio `control`, sem borda e sem ícone; o título leva o tom, o corpo fica em `ink.muted` e as ações são `Link`. Use um só nível de ênfase por tela: se já existe um bloco, os outros avisos viram frase em linha. Título diz o fato, corpo diz o próximo passo; nunca "Ocorreu um erro", sem "por favor", "ops" ou "inválido".
- Props: `format?: 'inline' | 'block'` (padrão `inline`), `tone?: 'neutral' | 'warning' | 'danger' | 'success'` (padrão `neutral`), `children`, `role?`, mais as props do elemento. No bloco: `title?`, `actions?`, `inCard?` e `ref`. O tipo é uma união: `title`, `actions` e `inCard` só existem com `format="block"`.
- Role: `alert` no tom `danger` e `status` nos demais; `role` troca. Erro depois de ação é `alert`; o resto só informa.
- Resumo de erros: bloco `danger` no topo do formulário, título "Falta corrigir N coisas" e uma lista de links, um por campo, que o corpo estiliza em `danger`. A tela passa `tabIndex={-1}` e um `ref` para mandar o foco até ele no envio. Aparece mesmo com um erro só.
- Tom `success`: não existe token `success`, então usa `brand.text`.
- Medida: o espaço entre título e corpo é 4px; o protótipo usa 2px, que não existe na escala.
- Galeria: `/design-system/notice`.

### StateScreen

- Uso: conteúdo de tela inteira para os estados fora do caminho normal. `empty` mostra o símbolo do SAACI (56px, `/logo-simbolo.png` via `next/image`, `alt` vazio), `success` um check em `brand.text` e `connectionError` um wi-fi cortado em `danger`, os dois a 32px (`Icon xl`). A arte não ganha círculo de fundo. Título em `title`, texto em `support`, 8px entre os dois e 24px até as ações (coluna, até 340px). O símbolo do Saci nunca aparece em erro. O vazio orienta ("Registre a primeira atividade"), nunca diz "Nenhum item encontrado"; o erro diz que nada foi perdido, quando for verdade, e o próximo passo.
- Props: união por `variant`. `'empty' | 'success' | 'connectionError'` pedem `title`, `description` e `actions?`. `'loading'` pede só `label`. Título, texto e ações são da tela; o componente só dá a estrutura e a arte.
- Carregando: `Spinner lg` com `label` (lido pelo leitor de tela, uma vez) e a mesma frase visível abaixo.
- Nível: fica em `molecules/`, porque só compõe atoms (`Icon`, `Spinner`); o plano pedia `organisms/`, mas organism não pula degrau.
- Galeria: `/design-system/state-screen`.

### LoadingState

- Uso: carregamento de tela inteira. É o `StateScreen` com `variant="loading"` num atalho, sem desenho próprio.
- Props: `label: string`, no gerúndio ("Calculando suas horas").
- Galeria: `/design-system/state-screen`.

## Templates

### AppFrame

- Uso: moldura de toda tela do app. Coluna de até 480px (`sizes.content`), centralizada, fundo `surface.sunken`, `min-height` em `100dvh`. Em tela larga é a mesma coluna: não há layout nem menu lateral de desktop (`doc/arquitetura.md`). É a "coluna de 480px" dos fundamentos, uma peça fora do catálogo de componentes.
- Props: `children` (vai no `main`), `topBar?` e `bottomNav?` (ReactNode). A região de cada barra só existe se a prop vier.
- Rolagem: é a da página. As barras usam `position: sticky` (topo e base), não `fixed`, para a barra de endereço do iOS recolher normalmente. A moldura aplica só `safe-area-inset-left/right`; o espaço de cima e de baixo é de `TopBar` e `BottomNav`.
- Galeria: `/design-system/app-frame`.

## Medidas sem token

`sizes` só tem `touch`, `control`, `topbar`, `bottomnav` e `content`. Estas medidas do desenho ficam em px no `recipe.ts` ou no `styles.ts` do componente: 16px e 32px do Spinner, 4px da ProgressBar, 20px do Badge, 84px de respiro do TextField sob o botão Mostrar/Ocultar, 18px do controle e 46px de recuo da divisória do ChoiceGroup, 56px do símbolo do StateScreen, 300px e 340px de largura máxima do texto e das ações do StateScreen, 36 por 4px da alça do BottomSheet, e 24px do símbolo, 1px da linha e 16px de rolagem da borda da TopBar.

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
