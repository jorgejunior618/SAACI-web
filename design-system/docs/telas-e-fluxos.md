# Telas e fluxos

55 telas em 9 fluxos. Todas desenhadas em **390 × 844** (mobile), em claro e escuro. O código-fonte de cada tela-componente está em `reference/prototipos/` (o arquivo citado em cada fluxo). Nesses arquivos, o bloco `renderVals()` no fim mostra **qual estado liga qual parte da tela**, e os dados de exemplo usados.

## Navegação

```
Sem sessão ──► Acesso ──► (1º login) Seu curso ──► App com barra inferior
                                                    ├─ Aba 1  Início
                                                    ├─ Aba 2  Atividades ──► Detalhe da atividade
                                                    │                    └─► Formulário (Seu pedido)
                                                    ├─ Botão  Registrar (central)
                                                    ├─ Aba 4  Eventos
                                                    └─ Aba 5  Perfil
```

Rotas sugeridas:

| Rota | Tela | Barra inferior |
|---|---|---|
| `/entrar`, `/criar-conta`, `/confirmar-email`, `/recuperar-senha`, `/nova-senha` | Acesso | não |
| `/curso` | Seu curso | não |
| `/` | Início | sim |
| `/registrar` | Registrar atividade (modal de tela cheia, "Fechar") | não |
| `/atividades` | Atividades | sim |
| `/atividades/:id` | Detalhe | sim |
| `/atividades/:id/corrigir` | Corrigir atividade ("Cancelar") | não |
| `/pedido` | Seu pedido | sim |
| `/pedido/previa` | Pré-visualizar | não |
| `/eventos` | Eventos | sim |
| `/perfil`, `/perfil/curso` | Perfil, Trocar curso | sim |

---

## 1. Acesso — `Acesso.html` (8 estados, sem barra)

| Estado | O que muda |
|---|---|
| `entrar` | Logo completo grande sobre placa branca + "Registre seus certificados e veja quantas horas complementares faltam." Campos E-mail de aluno (placeholder `nome@aluno.ifce.edu.br`) e Senha (com "Mostrar" e link "Esqueci minha senha"). Primário "Entrar". No pé: "Primeira vez aqui?" + secundário "Criar conta". |
| `senhaErrada` | Campo senha em erro: "A senha não confere com este e-mail. Confira se o Caps Lock está ligado e tente de novo." + "Não lembra? Crie uma nova senha em dois minutos." |
| `senhaFraca` | Criar conta (voltar no topo, logo pequeno). Título "Criar conta" / "Só o e-mail de aluno e uma senha. Curso e semestre vêm depois." Regras de senha ao vivo (uma ok, uma pendente "faltam 2"). "Criar conta" desabilitado. "Ao criar, você concorda com o aviso de privacidade." |
| `jaCadastrado` | Aviso neutro "Este e-mail já tem uma conta" com links Entrar / Criar uma nova senha. |
| `confirme` | Aviso âmbar "Para entrar, falta confirmar o seu e-mail." Título "Confirme seu e-mail", e-mail em destaque, instrução (spam/lixeira), "Reenviar link em 0:45" (desabilitado com contagem), "Digitei o e-mail errado", aviso "Não consegue abrir o e-mail institucional?". Rodapé: Sair · Excluir conta. |
| `recuperar` | "Criar uma nova senha" + campo e-mail + "Enviar link". |
| `novaSenha` | "Escolha a senha nova" / "Para ana…", regras ok, "Salvar senha nova", "Ao salvar, você sai dos outros aparelhos onde estava conectado." |
| `expirado` | Tela de estado "Este link não vale mais" / "Ele venceu ou já foi trocado por um mais novo. Isso é normal." + "Pedir um novo link" / "Voltar para Entrar". |

## 2. Seu curso — `Curso.html` (3 estados, sem barra, 1º login)

| Estado | O que muda |
|---|---|
| `buscando` | "Qual é o seu curso?" / "Assim o SAACI sabe quais atividades contam e quanto cada uma vale." Busca + lista de cursos ("Engenharia de Computação / Bacharelado · campus Fortaleza"). "Só aparecem os cursos que já têm as regras no SAACI." |
| `naoEncontrado` | Aviso "Ainda não temos as regras de "arquitetura"" + "Cursos com regras hoje" + "Enquanto o seu curso não chega, não dá para continuar." |
| `confirmado` | "Seu curso pede" **120h** (72px verde) + explicação dos 24 tipos; campo "Em que semestre você entrou no curso?" (`2023.2`, dica "Só contam as atividades feitas a partir dele."); link "Não é esse curso? Escolher outro"; rodapé primário "Ver meu painel". |

Rodapé das telas: links Sair · Excluir conta.

## 3. Início — `Vazio.html`, `Main.html`, `NoLimite.html`, `Completo.html` (aba 1)

| Tela | O que muda |
|---|---|
| Vazio · primeiro acesso | Total **120h** faltam, barra 0%. Seção "Seu caminho até as 120h" com 3 passos: (1, atual, pulsando) "Você está aqui · Registre uma atividade" + primário "Registrar a primeira atividade"; (2) "O SAACI calcula as horas"; (3, bandeira) "Você entrega o pedido". |
| Com atividades | Total **61h** / 59h feitas. Seção "Onde você já tem horas": cartões de item (6, 7, 12, 13) com "Ainda cabem Xh". Disclosure "Outras atividades que contam (20)" listando os itens restantes com a regra resumida. |
| Item no limite | Aviso de sucesso no topo "Você completou o item 13 / Ainda dá para somar nos itens 6, 7 e 12 e em outras 20 atividades." Total 23h. Cartão do item 13 em estado cheio: "30,0h de 30h · Completo. 4,0h registradas não contam". |
| Horas completas | Total em verde **120h** "Você completou suas horas" + "Seus itens somam 124h…" + primário "Ver como entregar seu pedido". |

Ordem dos cartões: itens com horas primeiro (o item que acabou de encher sobe).

## 4. Registrar atividade — `Registro.html` (10 estados, sem barra)

Topo: "Registrar atividade" + "Fechar". Rodapé fixo com "Vai contar" e o botão Registrar.

| # | Estado | O que muda |
|---|---|---|
| 1 | `semArquivo` | Upload (Tirar foto 64px / Escolher arquivo) + passos 2 e 3 explicando o que vem. Registrar desabilitado. |
| 2 | `lendo` | Arquivo enviado (nome, tamanho, "Trocar") + status "Lendo seu certificado, cerca de 20 segundos" + "A leitura só sugere. Você confere tudo, e nada é registrado antes de tocar em Registrar." |
| 3 | `sugestao` | Cartão de sugestão: "Parece ser este item. É esse mesmo?" Item 7 + "É esse" / "Escolher outro". |
| 4 | `confirmada` | Painel de regra do item 7 (cabem 42,0h; 18h de 60h; 40h ÷ 4 = 10,0h; vai contar 10,0h) + campos lidos do certificado (nome, horas, data). Rodapé "Vai contar 10,0h" + Registrar ativo. |
| 5 | `escolherOutro` | Busca "Em qual item do formulário essa atividade entra?" com resultados (12, 13, 14) e "A sugestão era o item 7. Voltar para a sugestão". |
| 6 | `limite` | Item 13: 3 palestras × 2h = 6,0h, mas cabem 4,0h → vai contar 4,0h + aviso âmbar. Campos: nome, quantas palestras, escolha "avulsa / parte de um evento", data. |
| 7 | `cheio` | Item 13 cheio: cabem 0,0h, vai contar 0,0h (em âmbar) + "A atividade fica guardada, mas não soma horas. Os itens 6, 7 e 12 ainda têm espaço." Registrar continua ativo. |
| 8 | `erros` | Resumo de erros no topo + campos horas e data em erro; cálculo mostra "falta". |
| 9 | `enviando` | Botão "Registrando" com spinner (`aria-busy`). |
| 10 | `sucesso` | Ícone de check + **+10h** (pop, verde) + "Atividade registrada / Curso de React com TypeScript entrou no item 7." + mini-total (51h faltam, barra) + "Registrar outra" / "Ver meu progresso". |

## 5. Atividades — `Certificados.html` (5 estados, aba 2)

Topo: "Atividades" (20/600).

| Estado | O que muda |
|---|---|
| `vazio` | Tela de estado "Suas atividades vão aparecer aqui" + "Registrar a primeira atividade" / "Ver meu pedido". |
| `comItens` | Cartão de entrega: **59h** contam no seu total, "8 comprovantes contam, em 4 itens.", primário 56px "Baixar os que contam" + "8 arquivos, cerca de 6,4 MB. Vem num arquivo compactado com uma pasta por item.", rodapé com "Escolher quais" e "Ver meu pedido ›". Seção "Por item": disclosures por item com a lista de atividades. |
| `naoConta` | Igual, com "1 não conta" no resumo, aviso vermelho em linha "1 comprovante não conta e fica de fora: …" e a atividade marcada "Não conta · antes do seu ingresso · fica fora do download" no grupo do item 13 (aberto). |
| `baixando` | No lugar do botão: status "Juntando seus comprovantes", barra 45%, "4 de 8 arquivos · 2,9 de 6,4 MB", "Pode continuar usando o app…", "Cancelar download". |
| `erro` | Aviso "O download parou no meio" + "Tentar de novo". |

## 6. Detalhe da atividade — `Detalhe.html` (6 estados)

Topo com voltar "Atividade".

| Estado | O que muda |
|---|---|
| `conta` | Badge "Conta", título da atividade (22/600), "Item 7 · …". Cartão: **10,0h** (verde) "contam no seu total" + porquê + tabela "Como foi calculado". "Dados da atividade" (lista de definição). "Comprovante" (arquivo com Ver/Baixar). Secundário "Corrigir dados" + terciário vermelho "Remover atividade". |
| `parcial` | Badge âmbar "Conta em parte", **1,0h** âmbar "de 2,0h contam no seu total", explicação do limite e da ordem. |
| `naoConta` | Badge vermelho "Não conta", **0,0h** vermelho, "Não conta porque terminou em 10/02/2023, antes do seu ingresso em 2023.2." |
| `editar` | Tela "Corrigir atividade" + "Cancelar", sem barra. Painel de regra com o novo cálculo (300h ÷ 4 = 75,0h, cabem 42,0h), aviso âmbar, campos com "Antes: 40" e dica "Um zero a mais muda bastante o cálculo.", nota sobre o comprovante. Rodapé "Vai contar (antes 10,0h) **42,0h**" + "Salvar correção". |
| `remover` | Bottom sheet "Remover esta atividade?" com impacto no total, aviso de que não dá para desfazer, "Se só um dado está errado, use Corrigir dados." + "Remover atividade" (destrutivo) / "Manter". |
| `removida` | Volta para Atividades com aviso de sucesso "Atividade removida / … saiu do seu total, que agora é 59h. Faltam 61h…" e as listas por item. |

## 7. Formulário (Seu pedido) — `Pedido.html` (5 estados)

Topo com voltar "Seu pedido" (ou "Pré-visualizar").

| Estado | O que muda |
|---|---|
| `incompleto` | **Faltam 3 coisas** / "O resto o SAACI já preencheu." Checklist (horas, nome, matrícula pendentes; comprovantes ok). "O que vai no formulário": tabela Item/Atividade/CH + "20 itens sem horas ficam com traço" + Total 59h. Rodapé secundário "Pré-visualizar como está" + "Dá para baixar antes de completar, se a coordenação aceitar." |
| `pronto` | **Tudo pronto** (verde). Checklist todo ok com ações Ver/Trocar. Tabela com total 120h + "Seus itens somam 124h. O que passa de 120h não entra no pedido." Rodapé primário "Pré-visualizar e baixar". |
| `previa` | Fundo `surface-muted`; "É assim que o PDF vai sair." + prévia em papel branco (cabeçalho IFCE, aluno, matrícula, tabela dos 24 itens, total, data de geração). Rodapé "Baixar formulário em PDF" + "Baixar em branco". Sem barra. |
| `gerando` | "Preenchendo os 24 itens, leva alguns segundos" + botão "Gerando o PDF" ocupado. |
| `baixado` | Estado "Formulário baixado" + arquivo (Abrir) + cartão "Próximo passo / Entregar na coordenação" com "Ver como entregar" e "Baixar os comprovantes que contam". |

## 8. Perfil — `Conta.html` (5 estados, aba 5)

| Estado | O que muda |
|---|---|
| `editando` | Avatar + nome + e-mail. Grupos: **Seus dados** (E-mail; Matrícula editando no lugar com Cancelar/Salvar; Semestre de início), **Curso** (Engenharia de Computação · meta de 120h, "Trocar"), **Aparência** (segmentado Automático/Claro/Escuro + "Automático segue o tema do celular."), **Sobre o SAACI** (Aviso de privacidade, Sair). Separado no fim: "Apagar minha conta" em vermelho + consequência. |
| `salvo` | Linha da matrícula volta ao normal com mensagem verde "Matrícula salva. Ela já entra no seu formulário." |
| `trocarCurso` | Tela "Trocar curso": campo travado, aviso âmbar "Com atividades lançadas, o curso fica travado", dois caminhos (remover as atividades / apagar a conta e começar de novo), nota sobre validade na coordenação. |
| `apagar` | Bottom sheet "Apagar sua conta?" com o que some, link "Baixar meus 9 comprovantes antes, 6,8 MB", campo de senha com "Esqueci", "Apagar minha conta" / "Manter minha conta". |
| `apagada` | Estado "Sua conta foi apagada" + prazo `[PRAZO DO RNF05]` + confirmação por e-mail + "Voltar ao início". Sem barra. |

## 9. Eventos — `Eventos.html` (aba 4)

Tela de estado: ícone de calendário com check, caption verde "Em construção", "Eventos está chegando", explicação e secundário "Voltar ao Início".

---

## Dados de exemplo usados no design

Aluna **Ana Beatriz Moura**, `ana.moura07@aluno.ifce.edu.br`, matrícula `2023104501`, ingresso `2023.2`, Engenharia de Computação.

| Item | Atividade | Conta | Término |
|---|---|---|---|
| 6 | Curso de inglês intermediário | 15,0h | 30/06/2025 |
| 7 | Curso de Git e GitHub | 8,0h | 03/05/2025 |
| 7 | Curso de Python para análise de dados | 10,0h | 14/11/2025 |
| 7 | Curso de React com TypeScript (40h) | 10,0h | 12/09/2026 |
| 12 | Semana de Engenharia de Computação 2025 | 12,0h | 19/09/2025 |
| 12 | Hackathon IFCE | 4,0h | 08/03/2026 |
| 13 | Palestra sobre computação quântica | 2,0h | 12/03/2025 |
| 13 | Palestra sobre IA em sistemas embarcados | 2,0h | 20/09/2025 |
| 13 | Ciclo de Palestras Tech IFCE (3 palestras) | 6,0h | 22/10/2026 |
| 13 | Palestra de boas-vindas aos calouros | não conta (antes do ingresso) | 10/02/2023 |

Útil como *seed* do banco de desenvolvimento.
