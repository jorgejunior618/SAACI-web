# Referência do Design System

Índice dos componentes e seus estados. Atualizado no mesmo commit que cria ou altera um componente.
A referência visual é `design-system/` (tokens, catálogo e PNGs das telas).

## Atoms

| Componente                     | Props principais                                                                               | Estados                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `Button`                       | `variant`: primary, secondary, tertiary, tertiaryDanger, danger; `size`: md, lg, xl; `isBlock` | padrão, pressionado, desabilitado, `isLoading`            |
| `ButtonLink`                   | mesmas variantes, navega                                                                       | padrão, pressionado                                       |
| `IconButton` / `IconLink`      | 48×48, texto opcional ("Fechar")                                                               | padrão, pressionado                                       |
| `TextLink` / `TextButton`      | `tone`: brand, muted, danger                                                                   | padrão, desabilitado                                      |
| `TextField`                    | `label`, `labelAside`, `hint`, `error`, `isRead`, `unreadMessage`, `action`, `leadingIcon`     | padrão, lido do certificado, não lido, erro, desabilitado |
| `Checkbox`                     | input nativo                                                                                   | marcado, desmarcado                                       |
| `ProgressBar`                  | `value`, `max`, `size` sm/lg, `label`                                                          | com rótulo vira progressbar acessível                     |
| `StatusBadge`                  | `status`: conta, parcial, nao_conta                                                            | texto e cor                                               |
| `Spinner`                      | `size` sm/lg                                                                                   | lg usa o redemoinho do logo                               |
| `Card`                         | `padding` none/md                                                                              | —                                                         |
| `InlineMessage`                | `tone`: neutral, warning, danger, success                                                      | —                                                         |
| `Icon`                         | `icon` (lucide-react), `size`                                                                  | sempre decorativo                                         |
| `LogoCompleto` / `LogoSimbolo` | `width`                                                                                        | logo completo sempre em placa branca                      |
| `ThemeToggle`                  | sem props; troca entre Claro e Escuro                                                          | lua no claro, sol no escuro, `aria-pressed`               |

## Molecules

| Componente      | Uso                                                         |
| --------------- | ----------------------------------------------------------- |
| `Notice`        | aviso sem borda colorida; o tom muda só o título            |
| `ErrorSummary`  | resumo de erros no topo, com link para cada campo           |
| `Status`        | espera com tempo previsto, `role="status"`                  |
| `ChoiceGroup`   | radios em lista, marcado com `brand.soft`                   |
| `CalcTable`     | "Como foi calculado", terminando em "Vai contar"            |
| `Disclosure`    | `<details>` com chevron que gira                            |
| `ItemList`      | lista de itens ou cursos; com `onSelect` vira listbox       |
| `FileRow`       | arquivo com ações de texto                                  |
| `PasswordRules` | regras de senha ao vivo                                     |
| `Steps`         | passos numerados, md com cartão no passo atual, sm em linha |
| `StateScreen`   | vazio, sucesso, erro, em construção                         |
| `LoadingState`  | carregamento de tela inteira                                |
| `GroupedList`   | lista agrupada com divisória recuada                        |
| `PageHeader`    | título de tela sem barra de topo                            |

## Organisms

| Componente     | Uso                                                                                |
| -------------- | ---------------------------------------------------------------------------------- |
| `TopBar`       | variantes brand, tab, task e back; o canto direito fica livre para o `ThemeToggle` |
| `ActionFooter` | rodapé fixo com resumo "Vai contar" e a ação da tela                               |
| `ConfirmSheet` | bottom sheet de confirmação em `<dialog>` nativo                                   |
| `TotalCard`    | total do Início (hero) e mini-total do sucesso (compact)                           |
| `RulePanel`    | regra do item, quanto cabe e a conta                                               |

## Templates

| Componente | Uso                                                                                     |
| ---------- | --------------------------------------------------------------------------------------- |
| `AppFrame` | coluna de 480px centralizada, com o `ThemeToggle`; `hasNav` reserva espaço para a barra |
| `Screen`   | barra de topo, conteúdo e rodapé de ação                                                |
