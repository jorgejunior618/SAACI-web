# SAACI — Design System

Design system do **SAACI**, o Sistema de Apoio Acadêmico Colaborativo do IFCE. É um app **mobile-first** em que o aluno registra certificados de atividades complementares e acompanha quantas horas faltam para a meta do curso (ex.: 120h em Engenharia de Computação).

Este pacote foi extraído do design "Início — Horas complementares" (55 telas, 9 fluxos). Ele foi feito para ficar dentro do repositório e servir de fonte para gerar o código.

## Estrutura

```
design-system/
├── README.md                  ← você está aqui (índice + regras de ouro)
├── CLAUDE.md                  ← instruções para o Claude Code gerar o código
├── tokens/
│   ├── tokens.json            ← FONTE DA VERDADE: cores (claro/escuro), tipo, espaço, raio, sombra, tamanhos, com o "uso" de cada um
│   ├── tokens.css             ← os mesmos tokens como CSS custom properties (+ tema automático)
│   └── tailwind.preset.js     ← opcional, se o projeto usar Tailwind
├── css/
│   └── saaci.css              ← todos os componentes em CSS puro (prefixo sa-)
├── docs/
│   ├── fundamentos.md         ← cor, tipografia, espaço, forma, ícones, movimento, acessibilidade, voz
│   ├── componentes.md         ← catálogo: anatomia, variantes, estados e HTML de referência
│   ├── telas-e-fluxos.md      ← navegação, os 9 fluxos, cada tela e cada estado, com os textos
│   └── regras-de-negocio.md   ← os 24 itens, como as horas são calculadas, limites, estados Conta/Parcial/Não conta
├── assets/
│   ├── logo-simbolo.png       ← símbolo 240×240 (barra de topo, 24px)
│   └── logo-completo.png      ← logo com nome 520×466 (tela de Entrar)
└── reference/
    └── prototipos/*.html      ← código-fonte original das telas (formato do editor de design; ler, não copiar)
```

## Como usar

1. Carregue `tokens/tokens.css` e depois `css/saaci.css` no CSS global do app.
2. Monte as telas com as classes `sa-*` (ou recrie-as como componentes do seu framework, mantendo os mesmos tokens e a mesma anatomia).
3. Para gerar o código-base com o Claude Code, aponte para `design-system/CLAUDE.md` (veja a seção no fim desse arquivo).

## Regras de ouro (o que dá a "cara" do SAACI)

1. **Borda, não sombra.** Cartões são `surface` + 1px de `line` + raio 12px. A única sombra do sistema é `shadow-overlay`, usada só em bottom sheet e diálogo.
2. **Uma ação primária por tela.** Botão verde (`brand`) aparece uma vez. As demais ações são secundárias (contorno) ou terciárias (texto verde).
3. **Estado = texto + cor, nunca só cor.** "Conta" (verde), "Conta em parte" (âmbar), "Não conta" (vermelho), sempre escritos.
4. **O número é o herói.** Cada tela tem um número principal (`61h`, `10,0h`, `120h`) em `display`/`hero` com `tabular-nums`. A barra de progresso nunca é a única fonte do valor.
5. **Um único cinza de texto** (`ink-muted`). `ink-subtle` é só para ícone inativo, separador `·` e placeholder.
6. **Um único fundo tingido** (`brand-soft`), só para a opção marcada em listas de escolha.
7. **Alvo de toque ≥ 48px**, campos com 16px (evita o zoom no iOS), foco visível em 2px `focus` afastado 2px.
8. **Mostrar a conta.** Sempre que horas são calculadas, aparece a tabela "Como foi calculado" (`sa-calc`), terminando em "Vai contar"/"Conta no seu total".
9. **Português do Brasil, frases curtas e diretas, voz ativa**, número com vírgula decimal (`10,0h`), datas `dd/mm/aaaa`.
10. **Claro e escuro desde o início.** Tudo usa tokens; o Perfil oferece Automático / Claro / Escuro.
