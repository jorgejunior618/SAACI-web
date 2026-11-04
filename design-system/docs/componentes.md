# Componentes

Todos estão em `css/saaci.css` com prefixo `sa-`. O HTML abaixo é a **referência de anatomia e acessibilidade**. Ao gerar componentes num framework (React, Vue, Flutter…), mantenha a mesma estrutura, os mesmos tokens e os mesmos atributos ARIA.

Sugestão de nomes para os componentes do código entre parênteses.

---

## Estrutura de tela

### Tela (`Screen`)
Coluna com topo fixo, conteúdo rolável e rodapé/barra fixos. Fundo `surface-sunken`.

```html
<div class="sa-screen">
  <header class="sa-topbar">…</header>
  <main class="sa-main sa-main-gap">…</main>
  <footer class="sa-footer">…</footer>   <!-- opcional: ação do formulário -->
  <nav class="sa-nav">…</nav>            <!-- opcional: barra inferior -->
</div>
```

### Barra de topo (`TopBar`) — 56px, fundo `surface-sunken`, sem borda
Variantes:
- **Marca** (Início, Seu curso): símbolo 24px + "SAACI" em `brand-text`, 16/600.
- **Título de aba** (Atividades, Perfil): título 20/600.
- **Título de tarefa + ação à direita** (Registrar atividade + "Fechar"; Corrigir atividade + "Cancelar"): título 16/500, ação em `sa-iconbtn` com texto.
- **Voltar** (Detalhe, Seu pedido, Trocar curso): `sa-topbar-inner` com botão chevron-left 24px (`aria-label="Voltar para …"`) + título 16/500.

```html
<header class="sa-topbar">
  <span class="sa-topbar-brand"><img src="assets/logo-simbolo.png" alt="">SAACI</span>
</header>

<header class="sa-topbar sa-topbar-inner">
  <button class="sa-iconbtn" type="button" aria-label="Voltar para Atividades"><svg class="sa-icon sa-icon-lg">…chevron-left…</svg></button>
  <h1 class="sa-topbar-title">Atividade</h1>
</header>
```

### Barra inferior (`BottomNav`) — 60px + safe area, 5 abas
Início · Atividades · **Registrar** (botão central) · Eventos · Perfil.
Fundo `surface`, borda superior `line`. Rótulo 12/500 `ink-muted`, ícone 22px `ink-subtle`. Ativo: `aria-current="page"`, `brand-text`, peso 600, ícone `stroke-width: 2`.
O **Registrar** é um círculo `brand` de 48px com borda de 4px `surface`, subindo 22px acima da barra (`sa-nav-fab`), com ícone "+" em `on-brand`.
A barra **some** em fluxos de tarefa (Registrar, Corrigir, Pré-visualizar), em Acesso, Seu curso e Conta apagada.

```html
<nav class="sa-nav" aria-label="Principal">
  <a href="/" aria-current="page"><svg class="sa-icon">…home…</svg>Início</a>
  <a href="/atividades"><svg class="sa-icon">…list-checks…</svg>Atividades</a>
  <a href="/registrar"><span class="sa-nav-fab"><svg class="sa-icon">…plus…</svg></span>Registrar</a>
  <a href="/eventos"><svg class="sa-icon">…calendar…</svg>Eventos</a>
  <a href="/perfil"><svg class="sa-icon">…user…</svg>Perfil</a>
</nav>
```

### Rodapé de ação (`ActionFooter`)
Fundo `surface`, borda superior. Pode trazer um resumo acima do botão: "Vai contar **10,0h**" (número 20/600; cor `ink`, `warning` quando só parte conta).

```html
<footer class="sa-footer">
  <div class="sa-footer-sum"><span>Vai contar</span><b>10,0h</b></div>
  <button class="sa-btn sa-btn-primary sa-btn-block" type="button">Registrar</button>
</footer>
```

---

## Ações

### Botão (`Button`) — 48px, raio 6, 16/500
| Variante | Classe | Uso |
|---|---|---|
| Primário | `sa-btn-primary` | A ação da tela. **Uma por tela.** |
| Secundário | `sa-btn-secondary` | Alternativa (Escolher outro, Manter, Cancelar). Fundo `surface` + borda `line`. |
| Terciário | `sa-btn-tertiary` | Ação de texto verde (Trocar, Ver, Baixar, Escolher quais). Para remover em texto, cor `danger`. |
| Destrutivo | `sa-btn-danger` | Só dentro da confirmação (bottom sheet). |

Modificadores: `sa-btn-block` (largura total; padrão em mobile). Estados: `:active` (pressionado), `[disabled]` (fundo `line`, texto `ink-muted`), `[aria-busy="true"]` + `sa-spinner` + verbo no gerúndio ("Registrando", "Gerando o PDF").
Pares lado a lado usam grid 1fr 1fr com 8px ("É esse" / "Escolher outro").

### Botão de ícone (`IconButton`)
`sa-iconbtn`: 48×48 mínimo, sem fundo, pode ter texto ("Fechar", "Cancelar").

### Link (`Link`)
`sa-link`: `brand-text`, 500, sublinhado de 1px afastado 3px. Pode ser `<button>` quando não navega.

---

## Dados e progresso

### Barra de progresso (`ProgressBar`)
Trilho `progress-track`, preenchimento `progress`, raio 6, altura 4px (6px no total). Nunca sozinha: o número está sempre escrito ao lado.

```html
<div class="sa-bar" role="progressbar" aria-valuemin="0" aria-valuemax="120" aria-valuenow="59" aria-label="59 de 120 horas"><span style="width:49.2%"></span></div>
```

### Total de horas (`TotalCard`) — o painel do Início
Cartão com número herói "**61h**", rótulo "Faltam para completar suas horas", barra de 6px, e meta "59h feitas · meta de 120h".
Variante **completa** (`sa-total-done`): número em `brand-text` ("120h"), rótulo "Você completou suas horas", texto sobre excedente e botão primário "Ver como entregar seu pedido".

```html
<section class="sa-card sa-total" aria-label="Seu total de horas">
  <span class="sa-hero">61h</span>
  <p class="sa-total-label">Faltam para completar suas horas</p>
  <div class="sa-bar sa-bar-lg" role="progressbar" …><span style="width:49.2%"></span></div>
  <div class="sa-total-meta"><span>59h feitas</span><span>meta de 120h</span></div>
</section>
```

### Cartão de item (`CategoryCard`)
Link inteiro para as atividades do item. "Item 7" (caption) + nome (500, até 2 linhas) + chevron; horas "**18,0h** de 60h"; barra; rodapé "Ainda cabem 42,0h".
Variante **cheio** (`sa-cat-full`): horas e rodapé em `brand-text`, rodapé "Completo. 4,0h registradas não contam".

```html
<a class="sa-card sa-cat" href="…">
  <span class="sa-cat-head"><span class="sa-cat-titles"><span class="sa-cat-n">Item 7</span><span class="sa-cat-name">Curso na área de engenharia de computação</span></span><svg class="sa-icon sa-icon-sm">…chevron-right…</svg></span>
  <span class="sa-cat-hours"><b>18,0h</b><span>de 60h</span></span>
  <span class="sa-bar" aria-hidden="true"><span style="width:30%"></span></span>
  <span class="sa-cat-foot">Ainda cabem 42,0h</span>
</a>
```

### Badge de status (`StatusBadge`)
Texto + cor, **sem ícone**, fundo `surface-muted`, 20px de altura, 12/500.
`sa-badge-conta` ("Conta", verde) · `sa-badge-parcial` ("Conta em parte", âmbar) · `sa-badge-naoconta` ("Não conta", vermelho).

### Tabela de cálculo (`CalcTable`)
Mostra como as horas foram calculadas. 14px tabular; rótulos `ink-muted` à esquerda, valores à direita; rodapé com borda superior, 16/600.

```html
<table class="sa-calc" aria-live="polite">
  <caption>Quanto essa atividade vai contar</caption>
  <tbody>
    <tr><th scope="row">40h de curso ÷ 4</th><td>10,0h</td></tr>
    <tr><th scope="row">Cabem neste item</th><td>42,0h</td></tr>
  </tbody>
  <tfoot><tr><th scope="row">Vai contar</th><td>10,0h</td></tr></tfoot>
</table>
```

### Painel de regra (`RulePanel`)
Cartão que aparece assim que o item é escolhido. Cabeçalho verde "Item 7 · Curso na área…" + link "Trocar item"; texto da regra; "Ainda cabem **42,0h** neste item" / "18h de 60h"; barra; `CalcTable`; aviso em linha âmbar quando a atividade passa do limite.

### Lista de definição (`DataList`)
`sa-dl` + `sa-dl-row`: rótulo `ink-muted` à esquerda, valor 500 à direita, divisória recuada. Usada em "Dados da atividade" (Horas do certificado, Terminou em, Registrada em).

---

## Listas

### Lista de atividades (`ActivityList`)
Lista agrupada (cartão com divisórias recuadas). Cada linha: nome (500, uma linha com reticências) + meta "8,0h · 03/05/2025" + chevron. Quando não conta, a meta vira "**Não conta** · antes do seu ingresso" com `sa-act-naoconta`; parcial usa `sa-act-parcial`.
Variante com seleção (`sa-list-select`): checkbox à esquerda (para "Escolher quais" baixar).

### Disclosure (`Disclosure`)
`<details class="sa-disc">` com `summary` de 48px: título + contador + chevron que gira. Usado em "Outras atividades que contam (20)" no Início e nos grupos "Por item" de Atividades (resumo: "Item 7 / nome / 18,0h de 60h").

### Lista de itens / busca (`ItemPicker`)
Campo de busca com lupa (`sa-search`) + lista `role="listbox"` de `sa-item` (número à direita em coluna de 24px, nome 500, regra resumida 14px). Selecionado: `aria-selected="true"` → fundo `brand-soft`. Também usado para escolher o curso.

### Grupo de configurações (`SettingsGroup`)
Título de grupo 14/500 `ink-muted` com 32px acima; cartão com linhas de 56px: rótulo à esquerda, valor `ink-muted` à direita, chevron. Uma linha pode abrir edição **no lugar** (rótulo + campo + dica + Cancelar/Salvar). Ação perigosa fica separada no fim, depois de uma linha divisória, em `danger` ("Apagar minha conta") com a consequência escrita abaixo.

### Checklist com ação (`Checklist`)
Linha com marcador à esquerda (círculo verde com check = pronto; círculo tracejado `warning` = falta), título + subtítulo, e ação verde à direita ("Registrar ›", "Perfil ›", "Ver ›"). Toda linha leva ao lugar onde se resolve a pendência.

### Passos (`Steps`)
Linha do tempo vertical com círculos de 32px ligados por uma linha de 2px. Passo atual: círculo `brand` com pulso e cartão com ação. Os outros: círculo contornado + título 500 + texto de apoio. Versão pequena (24px) aparece em "Registrar · sem arquivo" para explicar o que vem depois.

---

## Formulários

### Campo (`TextField`)
Rótulo 14/500 → (dica 14 `ink-muted`) → (erro) → input 48px, borda `line-strong`, raio 6, 16px.
Estados:
- **Padrão**.
- **Lido do certificado** (`sa-field-read`): fundo `surface-muted` + selo à direita do rótulo "Lido do certificado, confira" (`sa-flag`, 12px).
- **Não lido** (`sa-field-unread`): borda tracejada `warning` + aviso âmbar.
- **Erro** (`sa-field-error`): borda dupla `danger` + mensagem `sa-error` **acima** do input, dizendo o que fazer com exemplo ("Digite no formato dd/mm/aaaa, por exemplo 12/09/2026.").
- **Valor anterior** em edição: selo "Antes: 40" no lugar do flag.
- **Com ação interna** (`sa-input-wrap` + `sa-input-action`): "Mostrar"/"Ocultar" senha.
Numéricos usam `inputmode="numeric"`. Rótulo pode ter link à direita ("Esqueci minha senha").

### Resumo de erros (`ErrorSummary`)
`sa-notice sa-notice-danger` no topo, `role="alert"`, título "Falta corrigir 2 coisas" e lista de links que levam a cada campo.

### Grupo de escolha (`ChoiceGroup`)
`<fieldset class="sa-choices">` com `legend` + lista em cartão; cada opção é um `<label class="sa-choice">` com radio/checkbox customizado (18px) e texto em duas linhas (opção + consequência, ex.: "Foi avulsa / Conta neste item, 2h por palestra"). Marcado → `brand-soft`.

### Controle segmentado (`SegmentedControl`)
3 opções iguais (Automático / Claro / Escuro). Trilho `surface-muted`, opção ativa `surface` com contorno `line`. Radios reais escondidos.

### Regras de senha (`PasswordRules`)
Lista ao vivo (`aria-live="polite"`) acima do campo: regra cumprida = círculo verde com check + texto `brand-text`; pendente = círculo contornado âmbar + texto `warning` com quanto falta ("Pelo menos 8 caracteres, faltam 2"). Botão "Criar conta" fica desabilitado enquanto houver pendência.

### Upload de comprovante (`Upload`)
Caixa tracejada (`sa-upload`) com primário grande 64px "Tirar foto do comprovante" (ícone câmera 24) e secundário "Escolher arquivo"; dica "PDF, JPG ou PNG, até 10 MB. Frente e verso? Junte os dois num PDF."; linha de privacidade "Um serviço de IA lê o seu comprovante. Saiba o que guardamos".

### Arquivo (`FileRow`)
Cartão `sa-file`: ícone de arquivo + nome (500, reticências) + tamanho tabular + ações terciárias ("Trocar"; "Ver" e "Baixar"; "Abrir").

### Sugestão da leitura (`SuggestionCard`)
Cartão neutro: pergunta "Parece ser este item. É esse mesmo?", item sugerido (Item 7 / nome / regra) e dois botões lado a lado "É esse" (primário) e "Escolher outro" (secundário).

---

## Feedback

### Aviso (`Notice`)
Bloco discreto, **sem borda colorida e sem ícone**, raio 6, fundo `surface` (ou `surface-muted` dentro de cartão). Título 16/500 + corpo 14 `ink-muted` + ações em links.
Tons mudam **só a cor do título**: neutro (`ink`), `sa-notice-success` (`brand-text`), `sa-notice-warning`, `sa-notice-danger`.
Uso: "Você completou o item 13", "Atividade removida", "Este e-mail já tem uma conta", "O download parou no meio", "Com atividades lançadas, o curso fica travado".

### Aviso em linha (`InlineMessage`)
Uma frase 14px, sem caixa: `sa-inline` + `-warning` / `-danger` / `-success`. Ex.: "Essa atividade vale 6,0h, mas só cabem mais 4,0h neste item."

### Status (`Status`) e Spinner
`sa-status` com `role="status"`: spinner 16px + texto com tempo esperado ("Lendo seu certificado, cerca de 20 segundos"). Spinner grande (`sa-spinner-lg`) usa `redemoinho` com topo `brand`.
Progresso de download: status + barra 6px + "4 de 8 arquivos · 2,9 de 6,4 MB" + "Cancelar download".

### Tela de estado (`EmptyState` / `ResultState`)
Centralizada: ícone em círculo de 56–64px (`surface` + borda), (caption opcional, ex. "Em construção"), título `title`, texto `support` (máx. 300px), ações empilhadas (máx. 340px). Usada em: vazio de Atividades, Eventos em construção, Atividade registrada, Formulário baixado, Link expirado, Conta apagada.

### Bottom sheet de confirmação (`ConfirmSheet`)
`sa-scrim` + `sa-sheet` (`role="dialog"`, `aria-modal`): alça 36×4, título, consequência concreta com números ("…sai do seu total, que volta de 69h para 59h"), dica de alternativa ("Se só um dado está errado, use Corrigir dados."), ações empilhadas: destrutivo + "Manter". Para apagar conta, pede a senha.

---

## Identidade

### Logo
- `assets/logo-simbolo.png`: símbolo, 24px na barra de topo, 32px no mapa.
- `assets/logo-completo.png`: logo com nome, ~216px de largura sobre placa branca (`sa-logo-plate`) na tela Entrar; 144px nas demais telas de acesso. `alt="SAACI, Sistema de Apoio Acadêmico Colaborativo do IFCE"`.

### Avatar
Círculo 48px, `surface` + borda, iniciais 16/600 `brand-text` ("AM").
