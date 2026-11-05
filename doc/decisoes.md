# Decisões

Registro do porquê. O "como" está nos outros documentos, e o "o quê" está no código.

## Origem

Os padrões vieram da pasta `tecnica/`, feita para outro sistema (Lida, gestão de fazendas), e foram
reavaliados um a um em 02/11/2026. O requisito de produto vive no repositório `SAACI-produto`.

## Front primeiro, com dados mockados (03/11/2026)

O backend saiu do projeto até o front estar pronto. Ele tinha sido escolhido no início e foi
removido por inteiro: dependências, clientes, proteção de rota e configuração local.

| Decisão                                  | Por quê                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| Mock em memória dentro de `services/`    | A feature não percebe a troca quando o backend chegar              |
| Service devolve Promise sobre o mock     | Loading, erro e cache já nascem no formato que a rede vai exigir   |
| TanStack Query continua                  | Cache e invalidação não dependem de rede                           |
| Sem proteção de rota                     | Sem backend não há sessão; volta junto com a autenticação          |
| Grupos de rota e telas de conta mantidos | São telas do produto (RF01 a RF08, RF39, RF40), não infraestrutura |

## Telas do design exportado (03/11/2026)

As telas seguem `design-system/` (Claude Design), portado para Panda e para as convenções deste
projeto: do pacote vieram tokens, fonte, cores, espaço e o resultado final de cada tela.

| Decisão                                                                   | Por quê                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonte Geist via `next/font`, não fonte de sistema                         | O design depende dela nos números grandes. Servida pelo próprio site, sem chamada ao Google em uso. Diverge de `tokens-visuais.html` do SAACI-produto, que precisa ser atualizado                                                                       |
| Verde-escuro do logo como ação primária                                   | Paleta do design; o azul de `tokens-visuais.html` saiu da ação                                                                                                                                                                                          |
| Tema claro, escuro e automático desde o início                            | Pedido pelo design                                                                                                                                                                                                                                      |
| Barra inferior com Registrar central, coluna de 480px                     | Mobile-first; em tela larga a coluna centraliza em vez de virar lateral                                                                                                                                                                                 |
| Rotas mantidas, com as telas novas do design                              | `/curso`, `/atividades/[id]`, `/atividades/[id]/corrigir`, `/formulario/previa`, `/eventos`, `/perfil/curso`, `/privacidade`, `/conta-apagada`                                                                                                          |
| `/resumo` saiu                                                            | O design juntou resumo por categoria e download em Atividades (RF35, RF36)                                                                                                                                                                              |
| Grupos `(curso)`, `(tarefa)` e `(livre)`                                  | Tarefas sem barra inferior e telas abertas sem sessão                                                                                                                                                                                                   |
| Mock no `localStorage`, começando vazio                                   | Tudo nasce do que a pessoa faz no app; o painel "Mock" (dev) só simula o link de confirmação e erros                                                                                                                                                    |
| Sessão só no navegador, sem prefetch no servidor                          | Enquanto não há backend, o servidor não enxerga o mock. O prefetch volta junto com o backend                                                                                                                                                            |
| Leitura por IA, `.zip` e PDF simulados                                    | Sem backend nem biblioteca; a tela diz quando o arquivo é simulado                                                                                                                                                                                      |
| Nome completo editável no Perfil                                          | O pedido cobra "Seu nome completo" e o cadastro só pede e-mail e senha                                                                                                                                                                                  |
| Comprovante guardado em cópia reduzida (03/11/2026)                       | O localStorage tem cerca de 5 MB. Foto vira JPEG de até 1280px; PDF guarda só nome e tamanho, porque cortar o PDF o tornaria ilegível                                                                                                                   |
| Botão de modo escuro no canto superior direito, em toda tela (03/11/2026) | Pedido explícito, além do design. Fica em `position: absolute` no `AppFrame`, por cima da tela, sem criar barra onde o design não tem. A barra de topo reserva o canto, e o aviso do topo de Confirme seu e-mail desce. O Automático continua no Perfil |
| Marcadores visíveis onde falta dado real                                  | `[PRAZO DO RNF05]`, texto do aviso de privacidade e passo a passo de entrega (RF37)                                                                                                                                                                     |

## Base reduzida ao login (05/11/2026)

As telas tinham sido geradas sem validação da equipe. O projeto voltou ao ponto de partida: stack,
arquitetura, design system e a tela de login. Telas e domínios voltam um a um, validados.

| Decisão                                                     | Por quê                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Fica só o login; saem cadastro, recuperação e verificação   | Ponto de partida limpo; as outras telas voltam validadas                                    |
| Depois de entrar, `/` mostra só o logo e o botão Sair       | Rota mínima protegida pelo `SessionGate`, sem antecipar a tela de Início                    |
| Conta de exemplo criada pelo painel "Mock"                  | Sem cadastro, o mock vazio não teria conta; o mock continua começando vazio                 |
| Sessão reduzida a `{ email }`, mock na `versao: 3`          | Curso, ingresso e confirmação dependiam de domínios removidos                               |
| `SessionGate` com dois modos, `visitante` e `aluno`         | Os outros modos voltam com as telas de confirmação de e-mail e curso                        |
| Design system: só o que está catalogado em `design-system/` | Componente de domínio do catálogo (TotalCard, RulePanel…) fica; `Checkbox`, fora dele, saiu |
| `ThemeToggle`, `AppFrame` e `LoadingState` mantidos         | Fora do catálogo, mas são decisão da equipe ou aplicam regra de `fundamentos.md`            |
| Nenhuma dependência removida                                | Todas seguem em uso pelo login, pelo design system ou pela configuração                     |

## Confirmado de `tecnica/`

| Decisão                                 | Por quê                                                   |
| --------------------------------------- | --------------------------------------------------------- |
| Panda CSS                               | Sem runtime, funciona em Server Component                 |
| React Hook Form + Valibot               | Bundle menor, ajuda na meta de 3 s em mobile (RNF14)      |
| TanStack Query com prefetch             | Painel, resumo e formulário leem e invalidam juntos       |
| `app/` fino + `features/` + `services/` | Componente não fica preso à convenção de arquivos do Next |
| Vitest + Testing Library                | Mesma API do Jest, mais rápido                            |

## Diferente de `tecnica/`

| Decisão                                         | Por quê                                                         |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Grupos `(auth)`, `(verificacao)` e `(aluno)`    | Só existe o aluno. Conta não confirmada tem tela própria (RF05) |
| Sem `html-to-image` nem biblioteca de gráfico   | Nenhum requisito do MVP pede                                    |
| lucide-react                                    | Evita desenhar ícone à mão; o projeto é OSS                     |
| Só `preset-base` do Panda                       | Valor fora dos tokens do SAACI nem tem nome                     |
| ESLint garante fronteiras de importação         | Regra escrita só em documento não segura contribuidor de OSS    |
| Node 22 + pnpm                                  | Vitest 5 exige Node 22.12 ou maior                              |
| TypeScript 6, não 7                             | `typescript-eslint` não suporta TS 7 ainda                      |
| Prettier, Husky e commitlint do `SAACI-produto` | Mesmo padrão nos dois repositórios                              |

## Pendências

| Assunto                       | Decidir quando                                                               |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Backend                       | Quando o front estiver pronto                                                |
| Hospedagem                    | Antes do lançamento                                                          |
| Envio atômico de comprovante  | Na tela de registro (RNF24)                                                  |
| Tamanho máximo do comprovante | O design fixou 10 MB; confirmar no SAACI-produto (RF31, RNF25)               |
| Agente de IA no registro      | O design já mostra a leitura do comprovante; falta decisão de produto e LGPD |
| Matrícula no perfil           | O design já tem o campo; falta fechar no SAACI-produto (RNF06)               |
| Início do semestre            | `.1` começa em janeiro e `.2` em julho; confirmar com a coordenação          |
| Marco 0 do `SAACI-produto`    | O roadmap só destrava o Marco 1 depois das revisões de documento             |

### Já levantado para quando o backend voltar

- O domínio institucional (RF02) precisa ser barrado no servidor, não só na tela.
- Conta não confirmada pode não ter sessão, e corrigir o e-mail nesse estado (RF40) depende de como
  o backend trata isso.
- Comprovante é privado do dono e nunca fica em endereço público (RNF04).
- Exclusão de conta apaga dados e arquivos, inclusive cópias de segurança (RF33, RNF05).
