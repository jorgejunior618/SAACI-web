# Fundamentos

Valores exatos em `tokens/tokens.json`. Este documento explica **quando** usar cada um.

## Cor

### Superfícies (de trás para frente)

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `surface-sunken` | `#f6f2ea` | `#14130f` | Fundo da tela (creme quente). Barra de topo também usa este fundo. |
| `surface` | `#ffffff` | `#1d1b17` | Cartões, campos, barra inferior, rodapé de ação. Separado do fundo por `line`, nunca por sombra. |
| `surface-muted` | `#f5f1e8` | `#26241f` | Bloco discreto *dentro* de cartão: aviso, campo lido do certificado, controle segmentado. Sem borda. |
| `surface-raised` | `#ffffff` | `#28261f` | Bottom sheet e diálogo (com `shadow-overlay` + `scrim`). |

### Texto e linhas

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `ink` | `#1f1d18` | `#f2eee6` | Texto principal e números grandes. |
| `ink-muted` | `#635d51` | `#b8b1a3` | **Único** cinza de texto: rótulo pequeno, metadado, regra resumida, contador. |
| `ink-subtle` | `#8c8474` | `#857f71` | Só ícone inativo, separador `·` e placeholder. **Não** é cor de leitura. |
| `line` | `#e6dfd2` | `#34312a` | Toda borda e divisória, sempre 1px. |
| `line-strong` | `#8f8778` | `#7a7466` | Só contorno de controle (campo, checkbox, radio), que precisa de contraste 3:1. |

### Marca e progresso

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `brand` | `#125a34` | `#6fc98c` | Verde-escuro do logo. Botão primário, item ativo da barra, botão central Registrar. |
| `brand-pressed` | `#0c4627` | `#8ad6a2` | Primário pressionado. |
| `on-brand` | `#ffffff` | `#0b2414` | Texto/ícone sobre `brand`. |
| `brand-text` | `#125a34` | `#8ad6a2` | Verde em texto: link, título do painel de regra, total completo, estado "Conta". |
| `brand-soft` | `#e7eee3` | `#1f3326` | **Único** fundo tingido: opção marcada em lista de escolha. Não use em painel, badge ou aviso. |
| `progress` | `#2f9e41` | `#4cbb66` | Verde institucional da Rede Federal. Só o preenchimento da barra. |
| `progress-track` | `#ebe5d9` | `#2f2c25` | Trilho da barra. |

### Estados

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `warning` | `#8a5a00` | `#e9b85a` | Âmbar. "Conta em parte", item cheio, data antes do ingresso, campo não lido. |
| `danger` | `#b5161b` | `#ff8f85` | Vermelho em texto: erro de campo, "Não conta", ação destrutiva em texto. |
| `danger-fill` | `#cd191e` | `#ff8f85` | Só o fundo do botão destrutivo. |
| `on-danger` | `#ffffff` | `#2b0606` | Texto sobre `danger-fill`. |

### Identidade (fora dos componentes)

`gorro` (`#d81e1e`) e `redemoinho` (`#6f6f6f`) vêm do logo do Saci. Só aparecem no logo, na capa e no indicador de carregamento grande (`sa-spinner-lg`). **Nunca** em componente.

### Utilitários

- `focus` = `brand`. O anel de foco tem 2px sólidos e fica 2px afastado do elemento (`outline-offset: 2px`), para ficar sobre o fundo e não sumir no botão verde.
- `scrim`: véu atrás de bottom sheet e diálogo.

## Tipografia

Família única: **Geist** (Google Fonts, pesos 400/500/600), com fallback do sistema.

| Estilo | Tamanho / altura | Peso | Uso |
|---|---|---|---|
| `hero` | 56 / 60, tracking −1.6px | 600 | O número do painel Início (`61h`) e do sucesso (`+10h`). |
| `hero-xl` | 72 / 76, tracking −2px | 600 | Só a meta do curso na confirmação ("Seu curso pede **120h**"). |
| `display` | 32 / 36, tracking −0.64px | 600 | O número da tela: "Vai contar" no Detalhe, total em Atividades, "Tudo pronto". **Um por tela.** |
| `heading` | 24 / 30 | 600 | Título de tela sem barra de topo (Acesso, Seu curso). |
| `title` | 20 / 26, tracking −0.2px | 600 | Título de seção, título de tela grande na barra, número de um cartão (`18,0h`). |
| `body` | 16 / 24 | 400 | Corpo de texto e valor digitado. 16px evita o zoom do celular. |
| `body-strong` | 16 / 24 | 500 | Nome de item/atividade, texto de botão. |
| `support` | 14 / 20 | 400 | Metadado, rótulo sob número, regra resumida, aviso em linha. Cor `ink-muted`. |
| `label` | 14 / 20 | 500 | Rótulo de campo, cabeçalho de grupo. |
| `caption` | 12 / 16 | 500 | Badge, rótulo da barra inferior, "Item 7". Menor tamanho do produto. |

Todo número de horas usa `font-variant-numeric: tabular-nums` (`.sa-num`).

## Espaço

Escala de 4px: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32.

- **4px**: entre o número e o rótulo logo abaixo; entre linhas de um mesmo item.
- **8px**: entre rótulo e campo; entre cartões da mesma lista.
- **12px**: padding vertical de linha de lista.
- **16px**: margem lateral da tela e padding de cartão.
- **24px**: entre blocos de formulário e entre seções diferentes.
- **32px**: acima de título de seção. O ar fica **em cima** do título, não embaixo (título de seção tem 32px acima e 12px abaixo).

## Forma

- `radius-control` 6px: botão, campo, badge, aviso, barra de progresso.
- `radius-card` 12px: cartão, lista agrupada, bottom sheet (só cantos de cima).
- Círculo: avatar, passos numerados, ícone de tela de estado, botão central Registrar.
- Divisórias de lista são **recuadas**: começam alinhadas ao texto, não à borda (ex.: `left: 46px` quando há checkbox/radio, `left: 16px` sem).

## Tamanhos

- `size-touch` 48px: alvo mínimo de qualquer controle, mesmo que o desenho seja menor.
- `size-control` 48px: altura de campo e botão. Botão de destaque (Tirar foto, Baixar os que contam) pode ir a 56–64px.
- `size-topbar` 56px · `size-bottomnav` 60px (+ `env(safe-area-inset-bottom)`).
- Barra de progresso: 4px nos cartões e no painel de regra; 6px no total.
- Tela de referência: **390 × 844** (iPhone 14). Em telas largas, o conteúdo fica centralizado com `max-width: 480px`.

## Ícones

- Traço (stroke) de 1.5px, `stroke-linecap/linejoin: round`, sem preenchimento, `viewBox="0 0 24 24"`.
- Tamanhos: 16 (`sa-icon-sm`), 20 (padrão), 22 (barra inferior), 24 (`sa-icon-lg`), 28–32 (tela de estado).
- Ativo na barra inferior: `stroke-width: 2` + `brand-text`.
- Sempre `aria-hidden="true"` quando decorativo; botão só com ícone leva `aria-label`.
- Biblioteca sugerida para o código: **Lucide** (mesmo estilo). Ícones usados: home, list-checks, plus, calendar(-check), user, chevron-right/left/down, camera, file, search, check, download, flag, clock.
- **Nunca** emoji.

## Movimento

- Disclosure: chevron gira 180° em 200ms.
- Sucesso do registro: o número `+10h` entra com "pop" (500ms, `cubic-bezier(.2,.8,.2,1)`, sobe 12px e cresce de 0.96).
- Passo atual no Início vazio: pulso suave no círculo (2.4s, infinito).
- Spinner: 0.8s linear.
- Tudo respeita `prefers-reduced-motion` (animações desligadas ou bem mais lentas).

## Acessibilidade

- Contraste de texto ≥ 4.5:1 (inclusive o cinza de 14px); contorno de controle ≥ 3:1 (`line-strong`).
- Controles reais: `<button>`, `<a href>`, `<input>` com `<label>`. Nada de `div` clicável.
- Barra de progresso do total: `role="progressbar"` com `aria-valuenow/min/max` e `aria-label` ("59 de 120 horas"). Nos cartões, a barra é `aria-hidden` porque o número está escrito ao lado.
- Erros: resumo no topo com `role="alert"` e links para cada campo; cada campo com `aria-invalid` + `aria-describedby` apontando para a mensagem, que fica **acima** do input.
- Status assíncrono ("Lendo seu certificado…", "Juntando seus comprovantes") com `role="status"`.
- Bottom sheet: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.
- Item ativo da barra inferior: `aria-current="page"`.

## Voz e conteúdo

- **Português do Brasil**, tratamento por "você", frases curtas, voz ativa.
- Dizer o que aconteceu **e** o próximo passo: "O download parou no meio. Nada foi salvo no celular. Confira sua internet e tente de novo."
- Explicar o porquê das horas: "Ficou 1,0h de fora porque o item 13 chegou ao limite de 30h."
- Botões com verbo + objeto: "Registrar a primeira atividade", "Baixar os que contam", "Salvar correção". Confirmação destrutiva repete a ação ("Remover atividade") e a alternativa segura é explícita ("Manter").
- Horas sempre com uma casa decimal e vírgula em valores calculados (`10,0h`, `42,0h`), e inteiras em totais e metas (`61h`, `120h`).
- Datas `dd/mm/aaaa`; semestre `2023.2`.
- Separador de metadados: ` · ` (com `sa-dot`).
- Sem jargão técnico: "Um serviço de IA lê o seu comprovante" em vez de "OCR".
- Faltou um dado real? Use um marcador visível como `[PRAZO DO RNF05]`, nunca invente.
