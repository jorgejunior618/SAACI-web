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
- Props: `variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'`, `as?` e `href?` (botão que navega, como em `Link.as`), `block?`, `busy?`, `busyLabel?` (gerúndio, padrão "Enviando"), `icon?: LucideIcon`, `children`, mais as props de `button`. `type` padrão é `button`.
- Estados: `busy` marca `aria-busy`, troca o conteúdo por `Spinner sm` e `busyLabel`, deixa de repassar o `onClick` e vira `type="button"` (não envia o formulário). Não usa `disabled`, então a cor não muda. Um `onClick` em elemento pai ainda dispara.
- Link-botão: com `as` (`'a'` ou o `Link` do `next/link`) e `href` o botão vira link com o mesmo desenho. `type` não é repassado e `busy` e `disabled` não impedem a navegação, então serve só para ir a outra tela (por exemplo "Ver como entregar seu pedido").
- Composição: importa `Icon` e `Spinner`.
- Galeria: `/design-system/button`.

### Card

- Uso: base dos cartões (CategoryCard, SuggestionCard, RulePanel). `surface`, borda de 1px em `line`, raio `card`, padding 16px, sem sombra. Sempre `display: block`, inclusive com `as="a"`.
- Props: `as?: ElementType` (`div` por padrão), `children`, e as props do elemento escolhido (`href` com `a`).
- Galeria: `/design-system/card`.

### Icon

- Uso: invólucro do `lucide-react` com traço de 1,5px e `currentColor`. Escondido de leitor de tela; o texto ao lado carrega o significado. Nunca sozinho, sem emoji.
- Props: `icon: LucideIcon`, `size?: 'sm' | 'md' | 'lg' | 'xl'` (16, 20, 22 e 28px; padrão `md`). O `xl` é só o ícone dentro do círculo da tela de estado.
- Galeria: `/design-system/icon`.

### Link

- Uso: link de texto em `brand.text`, sublinhado. Renderiza `<a>`; a feature passa o `Link` do `next/link` em `as` para navegar sem recarregar (o design system não importa o roteador).
- Props: `as?: ElementType`, `isStandalone?` (alvo de 48px, para link sozinho na linha), `children` e as props de `a`.
- Galeria: `/design-system/link`.

### ProgressBar

- Uso: progresso de horas, 4px (`sm`) ou 6px (`md`, só no total do painel), trilho `progress.track`. `role="progressbar"` com `aria-valuenow/min/max`. `value` é cortado entre 0 e `max`. O número ("4,0h de 20h") é texto de quem usa.
- Props: `value: number`, `max: number`, `label: string` (vira `aria-label`) e `size?: 'sm' | 'md'` (padrão `sm`; variante no `recipe.ts`).
- Galeria: `/design-system/progress-bar`.

### Spinner

- Uso: carregamento. `sm` (16px) herda a cor do texto e vai dentro de botão ou linha; `lg` (32px) usa `redemoinho` com a ponta em `brand` e é só de tela inteira. `role="status"` com texto para leitor de tela.
- Props: `size?: 'sm' | 'lg'` (padrão `sm`), `label?: string` (padrão "Carregando"; use o gerúndio da ação).
- Medida: uma volta em 1,2s. O protótipo usa 0,8s, que parece rápido demais.
- Galeria: `/design-system/spinner`.

## Molecules

### TextField

- Uso: campo de texto com rótulo sempre visível e a regra logo abaixo. Ordem fixa: rótulo, `hint`, erro, campo; o erro fica antes do campo para o leitor de tela ouvir primeiro. Campo de 48px, borda 1px `line.strong`, texto de 16px (evita zoom no celular). Obrigatório não leva asterisco; opcional escreve "(opcional)" no rótulo. Não limpa o campo após um erro.
- Props: `label`, `hint?`, `error?`, `optional?`, `icon?: LucideIcon`, `status?: 'read' | 'unread'`, mais as props de `input` (`type`, `inputMode`, `ref`). `ref` vai como prop (React 19), então funciona com o `register` do React Hook Form.
- Estados: `error` usa borda `danger` mais grossa e mensagem em `danger`, sem ícone e sem fundo, e liga `aria-invalid`. `read` pinta o campo de `surface.muted` e escreve "Lido do certificado, confira" à direita do rótulo. `unread` deixa o campo vazio com borda tracejada `warning` e mostra `unreadMessage`, obrigatório nesse estado (o tipo recusa `unread` sem a frase), dizendo o que digitar. `error` tem prioridade: com ele o selo de leitura não aparece. `aria-describedby` junta regra, erro e selo.
- Senha: o mesmo componente com `type="password"`. O botão Mostrar/Ocultar (alvo de 48px, `aria-pressed`) aparece sozinho; não há prop `action` nem `PasswordField`.
- Ícone: `icon` põe um ícone do Lucide (`Search` na busca) à esquerda, em `ink.subtle`, 20px, com 12px de respiro e o texto começando a 40px. É enfeite (`aria-hidden`, sem toque): o rótulo continua sendo o nome do campo. Combina com `type="search"`. Passe `icon` de um Client Component: o ícone do Lucide é um objeto e não atravessa a fronteira vinda de um Server Component (o `TextField` é `'use client'`).
- Fora do componente: validação (Valibot, na tela) e máscara de data e horas (regra de domínio, na tela).
- Galeria: `/design-system/text-field`.

### TopBar

- Uso: barra no topo, 56px (`sizes.topbar`) mais a área segura de cima, no creme do fundo (`surface.sunken`), **sem borda parada e sem sombra**. Três variantes. `home` é a barra do Início: o símbolo (24px, `/logo-simbolo.png` via `next/image`, `alt` vazio) e "SAACI" em `brand.text`, sem Perfil nem Sair (Perfil é aba da barra inferior). `root` é a barra de uma aba (Atividades, Eventos, Perfil): o título em `h1`, `title` (20/26, peso 600), sem Voltar. `inner` é a de tela que abre a partir de uma aba: Voltar e o título em `h1`, 16px peso 500, com reticências se for longo.
- Props, união por `variant`: `home` não tem props; `root` pede `title`; `inner` pede `title` e aceita `backHref` **ou** `onBack` (os dois juntos o tipo recusa; nenhum dos dois, sem Voltar) e `linkAs?` (como `Link.as`) para trocar o `<a>` pelo `Link` do `next/link`.
- Exceção de ícone: Voltar aparece só com ícone, com `aria-label` "Voltar" e alvo de 48px. É a única exceção a "ícone nunca sozinho" (`doc/design-system.md`).
- Sair: saiu da barra. A tela de Perfil é quem oferece a saída da conta.
- Borda ao rolar: uma linha de 1px em `line` (`::after`) com a animação `edgeIn` ligada à rolagem por `animation-timeline: scroll()`, sem JavaScript, em `@supports`. Parado, sem borda. O `scroll()` segue o rolador mais próximo (a página numa tela, a janela na galeria). Navegador sem o recurso fica sem a linha. Com `prefers-reduced-motion` a duração fixa da regra global é trocada por `auto`, para a linha seguir a rolagem.
- Galeria: `/design-system/top-bar`.

### BottomNav

- Uso: barra inferior com quatro abas e uma ação central, nesta ordem: Início, Atividades, **Registrar**, Eventos e Perfil (Lucide `house`, `list-checks`, `plus`, `calendar-check`, `user`, 22px). 60px (`sizes.bottomnav`) mais a área segura de baixo, `surface`, borda superior de 1px em `line`, sem sombra. Ícone em `ink.subtle` e rótulo `caption` em `ink.muted`. A aba ativa (`aria-current="page"`) leva ícone e rótulo em `brand.text`, rótulo em peso 600 e traço do ícone em 2, sem pílula. Sempre ícone e rótulo.
- Registrar: círculo de 48px em `brand` com o ícone em `brand.on` (traço 2), que sobe 22px acima da barra e tem borda de 4px em `surface`. Pressionado vai para `brand.pressed`. Abre um fluxo, não é aba: nunca recebe `aria-current` e a tela do registro não mostra a barra. É o único elemento que ultrapassa o limite da barra.
- Props: `items` (tupla de quatro `{ id, label, href, icon }`, então o tipo recusa a quinta aba), `action` (`{ label, href, icon }`, desenhada entre a segunda e a terceira aba), `activeId`, `linkAs?` (como `Link.as`, para o `next/link` com prefetch) e `aria-label?` (padrão "Principal"). `activeId` que não existe deixa todas as abas inativas.
- Onde não aparece: Entrar, Criar conta, Recuperação de senha, Seu curso, Confirme seu e-mail e o fluxo de Registrar. A tela decide, o componente não sabe. Qual aba está ativa também é da tela (`usePathname` na feature); o design system não importa `next/navigation`. Detalhe da atividade e Formulário ficam dentro de Atividades, que continua ativa.
- Medida: o círculo de 48px, o recuo de -22px e a borda de 4px ficam em px no `styles.ts` (medidas sem token).
- Desktop: não há menu lateral nem breakpoint (`doc/arquitetura.md`). A barra continua embaixo, na coluna de 480px do `AppFrame`. A fonte do protótipo previa menu lateral; o doc vale mais.
- Galeria: `/design-system/bottom-nav`.

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

- Uso: anexa o comprovante por foto ou arquivo. Rótulo, `hint` com formatos, limite e dica de frente e verso, e uma área tracejada com `Tirar foto do comprovante` (`primary`, ícone de câmera) e, embaixo, `Escolher arquivo` (`secondary`, ícone de arquivo), empilhados e em linha inteira. A linha sobre a leitura por IA, com o link de privacidade, é obrigatória e o texto é da tela (`notice` e `privacyLinkLabel` são props obrigatórias, então o tipo impede de esquecê-la). Depois de anexar, um `Card` mostra o ícone, o nome truncado (o nome inteiro fica no `title`), o tamanho e `Trocar`; a dica e a linha da IA saem.
- Props: `label`, `hint`, `accept: string[]` (tipos MIME), `maxSizeMb`, `file?`, `error?`, `onSelect(file)`, `onReplace()`, `notice`, `privacyLinkLabel`, `privacyHref`, `privacyLinkAs?`.
- Conferência: tipo, tamanho e arquivo vazio são recusados no próprio componente, com uma frase de motivo e próximo passo em `danger` (`role="alert"`) e sem chamar `onSelect`. É ajuda na hora, não segurança. O `error` da tela vence o do componente; no envio que caiu, `file` continua e a frase diz que o arquivo segue anexado.
- Fora do componente: enviar e ler o arquivo (`services/`). O componente só devolve o `File`.
- Câmera: `Tirar foto do comprovante` usa `capture="environment"`. No desktop o navegador ignora e abre o seletor comum; os dois botões aparecem sempre. Não há arrastar e soltar.
- Medida: o protótipo de Registrar pede o botão de foto com 64px, ícone grande e texto de 17px, fora da escala do `Button`; o componente usa o `Button` padrão de 48px. A área pede 20px em cima e embaixo, que não existe na escala de 4px; usa 16px.
- Validação: os botões empilhados, com `Tirar foto do comprovante` primário, vêm do protótipo "Registrar atividade" (issue #11), validado pela equipe em 16/11/2026.
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

- Uso: conteúdo de tela inteira para os estados fora do caminho normal. A arte é um ícone de 28px (`Icon xl`) dentro de um círculo de 56px em `surface` com borda de 1px em `line`. `empty` usa o ícone que a tela escolhe, em `brand.text`; `success` um check em `brand.text`; `connectionError` um wi-fi cortado em `danger`. Acima do título pode vir um selo (`eyebrow`, `caption` em `brand.text`, 4px de respiro), como "Em construção". Título em `title`, texto em `support`, 8px entre os dois e 24px até as ações (coluna, até 340px). O símbolo do Saci não é arte de estado. O vazio orienta ("Registre a primeira atividade"), nunca diz "Nenhum item encontrado"; o erro diz que nada foi perdido, quando for verdade, e o próximo passo.
- Props: união por `variant`. `'empty'` pede `icon: LucideIcon`, `title` e `description`; `'success' | 'connectionError'` pedem `title` e `description`. Os três aceitam `eyebrow?`, `actions?` e `highlight?`. `'loading'` pede só `label`. Título, texto e ações são da tela; o componente só dá a estrutura e a arte. Passe `icon` de um Client Component: o ícone do Lucide é um objeto e não atravessa a fronteira vinda de um Server Component.
- Destaque: `highlight` é um número já formatado ("+10h", a atividade registrada) entre a arte e o título, em `display` com 56px/60px e -1,6px, cor `brand.text`, 8px acima do título. É o número grande da tela: com ele, o `TotalProgress` da mesma tela vai em `size="compact"`. Entra com o keyframe `popIn` (500ms, `easings.out`, sobe 12px e cresce de 96%); com `prefers-reduced-motion` só aparece.
- Carregando: `Spinner lg` com `label` (lido pelo leitor de tela, uma vez) e a mesma frase visível abaixo, sem círculo.
- Nível: fica em `molecules/`, porque só compõe atoms (`Icon`, `Spinner`); o plano pedia `organisms/`, mas organism não pula degrau.
- Validação: o `highlight` vem da tela de atividade registrada do protótipo "Registrar atividade" (issue #11), validado pela equipe em 16/11/2026.
- Galeria: `/design-system/state-screen`.

### LoadingState

- Uso: carregamento de tela inteira. É o `StateScreen` com `variant="loading"` num atalho, sem desenho próprio.
- Props: `label: string`, no gerúndio ("Calculando suas horas").
- Galeria: `/design-system/state-screen`.

### TotalProgress

- Uso: topo do painel. O total que **falta** em 56px/60px (`display` com tamanho próprio, ver "Medidas sem token"), o rótulo "Faltam para completar suas horas" 4px abaixo, a `ProgressBar size="md"` (6px) 16px abaixo e a linha de meta em `support` tabular ("73h feitas" à esquerda, "meta de 120h" à direita). O cartão tem 20px de respiro em cima e 16px nos outros lados. Um número grande por tela. Com 0h o cartão aparece como os outros, com a barra vazia e "0h feitas".
- Props: `doneHours` (o `totalHours` de `getProgress`), `missingHours` (o `missingHours` de `getProgress`, o número grande do cartão), `goalHours`, `itemsSum?` (o `itemsSum` de `getProgress`, só para a frase do excedente), `guideHref?`, `linkAs?` (como `Button.as`), `size?: 'default' | 'compact'` (padrão `default`). O componente não calcula (RNF20): mostra os números como chegam e só formata com `formatHours` (`src/utils/format-hours.ts`).
- Total: inteiro, arredondado para baixo e limitado à meta pelo cálculo único (`computeProgress`), nunca pelo componente. O "falta" também chega pronto, em `missingHours`: o componente não subtrai. Por isso a barra não passa de 100% e o "falta" não fica negativo. 119,9h somadas chegam como 119h e ainda não são completo.
- Completo (`doneHours >= goalHours`): o número vira a meta em `brand.text`, o rótulo diz "Você completou suas horas" e **não há barra**. Com `itemsSum` acima da meta, uma frase em `support` diz "Seus itens somam 124,6h. O que passa de 120h não é aproveitado." (12px abaixo do rótulo), com a soma em uma casa decimal, como chega. O botão primário em largura total "Ver como entregar seu pedido" (`Button as`, 16px abaixo) leva ao guia do formulário e só aparece com `guideHref`.
- Compacto: `size="compact"` é para tela que já tem outro número grande (a atividade registrada, com o `highlight` do `StateScreen`). O número cai para `title` tabular, na mesma linha de base do rótulo em minúscula ("51h faltam para completar suas horas", 8px entre os dois); a barra vem 12px abaixo e a linha de meta segue igual. Completo: "120h feitas, você completou suas horas", sem barra.
- Skeleton: `TotalProgressSkeleton`, blocos em `progress.track` com o keyframe `pulse`, escondidos de leitor de tela (`aria-hidden`), com a altura do número (60px) e da barra (6px).
- Validação: o `size="compact"` vem da tela de atividade registrada do protótipo "Registrar atividade" (issue #11), validado pela equipe em 16/11/2026.
- Galeria: `/design-system/total-progress`.

### CategoryCard

- Uso: um cartão por item em que o aluno já tem horas. "Item 7" em `caption` `ink.muted`, nome em `bodyStrong` até 2 linhas, horas em `title` tabular ("18,0h") com o máximo em `support` na mesma linha de base ("de 60h"), `ProgressBar` e rodapé `support` ("Ainda cabem 42,0h"). Ritmo: 12px do nome ao número, 8px entre número, barra e rodapé; os 8px entre cartões são da tela. Item sem horas não vira cartão: vai para o `Disclosure`.
- Props: `itemNumber`, `name`, `countedHours`, `maxHours`, `overflowHours?`, `href`, `linkAs?` (como `Link.as`). Recebe valores prontos (RNF20) e formata com `formatHours`.
- Completo (`countedHours >= maxHours`): número e rodapé em `brand.text`, rodapé "Completo. 4,0h registradas não contam" (ou só "Completo" sem excedente). Sem check, sem badge.
- Acessibilidade: o cartão inteiro é o link (`Card as="a"`), com a seta `ChevronRight` de 16px à direita. A barra fica `aria-hidden`, porque os números do texto dizem o mesmo.
- Skeleton: `CategoryCardSkeleton`, blocos com o keyframe `pulse`, `aria-hidden`.
- Galeria: `/design-system/category-card`.

### Disclosure

- Uso: seção de consulta que abre e fecha, feita com `<details>`/`<summary>`: funciona sem JavaScript e com leitor de tela. Cabeçalho com título (peso 500), contador em `ink.muted` e seta à direita que gira (`transition` de `durations.fast`; com `prefers-reduced-motion` a regra global zera a transição e a seta só pula, ainda legível). Um nível só: sem `Disclosure` dentro de `Disclosure`. Não esconde passo obrigatório. No painel vazio vem aberta. Na tela de Atividades é o grupo de cada item, com `eyebrow` e `aside`.
- Props: `title` (uma linha, com reticências), `eyebrow?` (rótulo acima do título em `caption` `ink.muted`, como "Item 6"), `count?` **ou** `aside?` (texto curto junto da seta, em `body` `ink.muted` tabular, como "15,0h de 60h"; os dois juntos o tipo recusa), `defaultOpen?` (só vale na primeira renderização), `children`, mais as props de `details`. `Disclosure.Row` (`itemNumber`, `name`, `rule?`) é a linha de item: número em coluna de 20px alinhada à direita, tabular, `ink.muted`; nome em `body`; regra em `support` abaixo; divisória com recuo a partir do nome. O corpo é um `ul`, então qualquer `li` (como o `ActivityRow`) também entra.
- Sem Skeleton: não recebe dado, só `children`.
- Galeria: `/design-system/disclosure`.

### ActivityRow

- Uso: linha de atividade registrada. Dois modos: navegação (a linha inteira é o link, com seta de 16px) ou seleção (checkbox de 18px, `aria-label` "Selecionar <título>", e a linha inteira é o rótulo dele: tocar em qualquer ponto marca ou desmarca, sem link e sem seta, para o aluno não sair da tela no meio da seleção). Na seleção, `isDisabled` mostra a linha sem poder marcar: checkbox desabilitado com fundo e borda `line` (o mesmo desenho do `Button` desabilitado), todo o texto em `ink.muted` (o "Não conta" perde o `danger`, mas o texto continua dizendo o porquê) e cursor `not-allowed`. Título `bodyStrong` em 1 linha com reticências, metadados `support` `ink.muted` separados por `·` em `ink.subtle`. O estado é dito pela **cor da duração**, sem badge: `counts` ("2,0h · 12/03/2025", tudo cinza), `partial` ("1,0h de 2,0h" em `warning`) e `doesNotCount` ("Não conta" em `danger` e o motivo em cinza).
- Props, união por `status`: `counts` pede `countedHours` e `endDate`; `partial` pede `countedHours`, `activityHours` e `endDate`; `doesNotCount` pede `reason`. Comum: `title`. Modo, outra união: `href` e `linkAs?` (navegação) **ou** `selection: { checked, onChange, isDisabled? }` (seleção); os dois juntos o tipo recusa. O `status` chega pronto (o DS não decide o que conta) e `endDate` chega formatada.
- Estrutura: renderiza `li`; a lista com borda e a ordem por data de término são da tela. Divisória com recuo; com `selection` o recuo acompanha o título (46px). Na navegação, o link cobre título, metadados e seta. Na seleção, o espaçamento da linha passa para o rótulo, e a borda também marca. Remover fica no detalhe, nunca por gesto de arrastar.
- Recuo exportado: `ACTIVITY_ROW_SELECTION_INDENT` (46px), o começo do título e da divisória no modo de seleção. Linha própria da tela na mesma lista (como "Marcar todos do item") alinha por ele.
- Validação: o modo de seleção (linha inteira marca, `isDisabled` e "Não conta" sem `danger` na linha desabilitada) foi validado pela equipe em 15/11/2026, sem tela no protótipo.
- Skeleton: `ActivityRowSkeleton` (também `li`), `aria-hidden`.
- Galeria: `/design-system/activity-row`.

### SuggestionCard

- Uso: mostra o item que a leitura do certificado sugeriu, separado do campo. `reading`: uma linha de status com `Spinner sm` e o tempo esperado ("Lendo seu certificado, cerca de 20 segundos"), sem caixa. `suggested`: `Card` neutro com a pergunta em `support` cinza ("Parece ser este item. É esse mesmo?"), o item ("Item 7" em `caption`, nome em `bodyStrong`, regra em `support`) e duas ações lado a lado: **É esse** (primário) e **Escolher outro** (secundário, a tela abre o `ItemPicker`). Sem cor própria.
- Props, união por `status`: `reading` aceita `readingMessage?`. `suggested` pede `item: { number, name, rule }`, `onConfirm` e `onChooseOther`. O tipo recusa callbacks no `reading` e `item` sem `suggested`.
- Regras: o campo de item **nunca** começa marcado com a sugestão; confirmar é ação do aluno (`onConfirm`). Sem sugestão, a tela pula o cartão e abre o `ItemPicker` direto. Leitura que falha não é erro: a tela escreve uma linha `support` dizendo que não deu para ler e que o aluno preenche. Esses dois casos são da tela, não deste componente.
- Acessibilidade: no `reading`, o spinner anuncia a frase como `status` e o texto visível fica `aria-hidden`, para o leitor de tela ouvir uma vez só. O cartão é uma região nomeada pela pergunta.
- Galeria: `/design-system/suggestion-card`.

## Organisms

Organism é o bloco que usa pelo menos uma molecule e pode usar atoms junto. Quem só compõe atoms
fica em `molecules/`.

### ItemPicker

- Uso: campo de busca que abre uma lista flutuante com os itens do formulário do curso, na ordem do formulário. Vem no bloco Item do registro, quando a leitura não sugeriu nada ou o aluno tocou em "Escolher outro". O campo é um `TextField` com a lupa (`icon={Search}`). A lista é um painel sobre o conteúdo, logo abaixo do campo: abre ao tocar ou digitar, fecha ao escolher, com Esc ou ao sair do campo, e **não empurra** o que vem depois. Cada linha: número numa coluna de 24px (tabular, `ink.muted`, à direita, sem cor de destaque), nome em `bodyStrong` e regra com o máximo em `support`, divisória com recuo de 52px. O item escolhido ganha `brand.soft`.
- Props: `items: { number, name, rule }[]`, `value: number | null`, `onChange(number)`, `query`, `onQueryChange`, `label` (a pergunta do campo) e `suggestions?` (palavras da frase de busca vazia). É controlado. O consumidor fornece os itens do curso e a regra já com o máximo ("até 60h"). Depois de uma escolha o componente chama `onQueryChange('')`.
- Regras: nenhum item vem marcado ao abrir e não existe "Não sei". Fechado, o campo mostra o item escolhido ("7 · Curso na área..."); aberto, volta a ser a busca e a lista mostra todos, com o escolhido marcado. O painel tem altura máxima de 280px (uns cinco itens) e rola por dentro; é a única rolagem aninhada do DS, aceita porque a lista não faz parte do fluxo. Sem resultado, o painel mostra uma frase que diz o que tentar ("Nenhum item tem 'hackathon'. Tente 'evento' ou 'curso'."), repetida numa região `role="status"` sempre montada.
- Busca: `filterItems` (`organisms/ItemPicker/utils.ts`), função pura. Cada palavra digitada precisa aparecer no nome ou na regra, em qualquer ordem, sem acento e sem diferença de maiúscula (`normalize('NFD')`, vale para "ç" e "ã"). Mantém a ordem do formulário; busca vazia devolve todos.
- Acessibilidade: padrão combobox com `listbox`/`option`. O foco fica no campo (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`). Setas movem o item destacado (contorno), Enter escolhe (sem enviar o formulário da tela), Esc fecha. Tocar numa linha não tira o foco do campo. Cada `option` leva `aria-selected`. Linha com alvo de toque de 48px.
- Borda e sem sombra: o painel usa `surface.raised` com borda `line.strong`, sem a sombra `overlay`, que é do bottom sheet.
- Client Component (guarda se está aberto e qual item está destacado).
- Galeria: `/design-system/item-picker`.

### RulePanel

- Uso: a regra do item escolhido, quanto ainda cabe e quanto a atividade vai contar, visíveis antes do envio. Cartão neutro (`Card`), **sem fundo verde**: a ênfase está só no título ("Item 13 · Palestra como ouvinte", `label` em `brand.text`). Ordem: regra em `body`, 4px abaixo; "Ainda cabem **4,0h** neste item" à esquerda e "26h de 30h" em cinza à direita (quebra linha, nunca corta); `ProgressBar`; tabela do cálculo (descrição à esquerda, valor à direita tabular, última linha "Vai contar" separada por borda fina e peso 600); aviso em uma frase (`Notice tone="warning"` inline), sem caixa.
- Props: `itemNumber`, `itemName`, `rule`, `usedHours`, `maxHours`, `calcRows: { label, value }[]`, `willCount`, `warning?`. Recebe tudo pronto e não calcula (RNF20); só formata com `formatHours`. O "Ainda cabem" é `maxHours - usedHours`, nunca negativo.
- Regras: a regra fica sempre visível, nunca em tooltip. Todos os valores da tabela na mesma unidade, para alinhar. Um aviso por vez, o mais grave primeiro. O aviso não bloqueia.
- Acessibilidade: o cartão é uma região nomeada pelo título. A tabela tem `aria-live="polite"` e `caption` "Quanto essa atividade vai contar", então o resultado é anunciado enquanto o aluno digita. A barra mede as horas usadas do item.
- Galeria: `/design-system/rule-panel`.

## Templates

### AppFrame

- Uso: moldura de toda tela do app. Coluna de até 480px (`sizes.content`), centralizada, fundo `surface.sunken`, `min-height` em `100dvh`. Em tela larga é a mesma coluna: não há layout nem menu lateral de desktop (`doc/arquitetura.md`). É a "coluna de 480px" dos fundamentos, uma peça fora do catálogo de componentes.
- Props: `children` (vai no `main`), `topBar?` e `bottomNav?` (ReactNode). A região de cada barra só existe se a prop vier.
- Rolagem: é a da página. As barras usam `position: sticky` (topo e base), não `fixed`, para a barra de endereço do iOS recolher normalmente. A moldura aplica só `safe-area-inset-left/right`; o espaço de cima e de baixo é de `TopBar` e `BottomNav`.
- Galeria: `/design-system/app-frame`.

## Medidas sem token

`sizes` só tem `touch`, `control`, `topbar`, `bottomnav` e `content`. Estas medidas do desenho ficam em px no `recipe.ts` ou no `styles.ts` do componente: 16px e 32px do Spinner, 4px da ProgressBar, 20px do Badge, 84px de respiro do TextField sob o botão Mostrar/Ocultar, 18px do controle e 46px de recuo da divisória do ChoiceGroup, 56px do círculo da arte do StateScreen, 300px e 340px de largura máxima do texto e das ações do StateScreen, 36 por 4px da alça do BottomSheet, e 24px do símbolo, 1px da linha e 16px de rolagem da borda da TopBar, e as larguras e alturas dos blocos do `Skeleton` do TotalProgress (96px, 60%, 60px, 20px), o círculo de 48px, o recuo de -22px e a borda de 4px da ação Registrar do BottomNav, o número de 56px com linha de 60px e -1,6px de espaçamento do TotalProgress e do `highlight` do StateScreen (sobre o textStyle `display`), os 500ms do `popIn` e os 6px da ProgressBar `md`, e os 18px do checkbox do ActivityRow com a área de toque de 48px (margens negativas de 12px e 15px que devolvem o espaço à linha).

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
