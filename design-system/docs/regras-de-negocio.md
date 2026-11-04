# Regras de negócio refletidas no design

O design mostra regras que o código precisa implementar para as telas fazerem sentido. Abaixo está o que dá para tirar das telas. **Confirme com o regulamento do curso antes de considerar definitivo.**

## Contexto

- Curso modelado: **Engenharia de Computação (Bacharelado), IFCE campus Fortaleza**.
- Meta: **120h** de atividades complementares.
- Só contam atividades que **terminaram a partir do semestre de ingresso** do aluno (ex.: `2023.2`).
- O formulário é o "Formulário para Solicitação de Atividades Complementares" da coordenação, com 24 itens e a coluna "CH Solicitada". Modelo conferido em 13/10/2026.
- O app deve suportar **vários cursos** no futuro: cada curso tem seus itens, regras e meta. Só aparecem na busca os cursos que já têm regras cadastradas.

## Os 24 itens (Engenharia de Computação)

| # | Item | Regra de conversão | Limite |
|---|---|---|---|
| 1 | Programa de iniciação científica ou tecnológica | 40h por período letivo | 80h |
| 2 | Programa de iniciação à docência | 40h por período letivo | 80h |
| 3 | Programa de monitoria | 40h por disciplina como monitor | 80h |
| 4 | Projeto de pesquisa ou extensão | 30h por projeto por período letivo | 60h |
| 5 | Atividades artístico-culturais ou esportivas | 1h a cada 2h de atividade | 60h |
| 6 | Curso de línguas | 1h a cada 4h de curso | 60h |
| 7 | Curso na área de engenharia de computação | 1h a cada 4h de curso | 60h |
| 8 | Curso fora da área de engenharia de computação | 1h a cada 6h de curso | 40h |
| 9 | Ministrar curso na área de engenharia de computação | 2h a cada 1h de curso | 60h |
| 10 | Certificação técnica | 30h por certificação | 60h |
| 11 | Organização de eventos técnicos ou científicos na área do curso | 20h por evento | 40h |
| 12 | Participação em eventos técnicos ou científicos na área do curso | 4h por dia de evento | 40h |
| 13 | Ouvinte em palestras da área do curso | 2h por palestra (não importa a duração) | 30h |
| 14 | Palestrante em palestras da área do curso | 8h por palestra | 30h |
| 15 | Projeto social extracurricular | 15h por projeto | 30h |
| 16 | Produção técnica com relatório | 3h a cada 10 páginas | 30h |
| 17 | Pôster em evento nacional | 4h × fator Qualis | 30h |
| 18 | Pôster em evento internacional | 5h × fator Qualis | 40h |
| 19 | Resumo publicado em evento nacional | 5h × fator Qualis | 40h |
| 20 | Resumo publicado em evento internacional | 6h × fator Qualis | 40h |
| 21 | Artigo em evento nacional | 6h × fator Qualis | 80h |
| 22 | Artigo em evento internacional | 7h × fator Qualis | 80h |
| 23 | Artigo em periódico nacional | 7h × fator Qualis | 80h |
| 24 | Artigo em periódico internacional | 8h × fator Qualis | 80h |

Sugestão de modelagem: cada item tem `unidade` (horas de curso, palestras, dias, projetos, páginas, períodos, certificações, fator Qualis), `fator` e `limite`. O formulário de registro pede a **quantidade na unidade do item** (ex.: "Horas do certificado" no item 7, "Quantas palestras" no item 13).

Regra de desambiguação mostrada no design: **palestra dentro de um evento conta pelo item 12** (por dia de evento), e não pelo 13. O registro pergunta "A palestra foi avulsa ou fez parte de um evento?".

## Cálculo de uma atividade

```
valor        = conversão(quantidade)             // ex.: 40h de curso ÷ 4 = 10,0h
cabem        = limite_do_item − horas_já_contadas_no_item
vai_contar   = antes_do_ingresso ? 0 : min(valor, max(cabem, 0))
```

- **Ordem**: dentro de um item, **as atividades mais antigas (data de término) contam primeiro**. Uma atividade nova e mais antiga pode empurrar outra para "Conta em parte". Recalcule o item inteiro quando algo muda.
- **Status da atividade**:
  - `conta`: `vai_contar == valor`
  - `parcial`: `0 < vai_contar < valor` (ex.: "1,0h de 2,0h contam")
  - `nao_conta`: `vai_contar == 0` (item cheio ou terminou antes do ingresso)
- A atividade que não conta **continua guardada** (com o comprovante), mas não soma e **fica fora do download**.
- Toda tela que mostra horas explica o motivo em linguagem simples ("Ficou 1,0h de fora porque o item 13 chegou ao limite de 30h. As palestras mais antigas contam primeiro, e esta é a mais recente.").

## Total

```
total_feito   = Σ vai_contar de todas as atividades     // pode passar da meta
total_pedido  = min(total_feito, meta)                   // o que vai no formulário
faltam        = max(meta − total_feito, 0)
```

- O Início mostra **quanto falta** como número principal; quando `faltam == 0`, mostra a meta em verde e "Seus itens somam 124h. O que passa de 120h não é aproveitado."
- **Item no limite**: quando um item chega ao limite, aparece no Início um aviso de sucesso "Você completou o item 13" com os itens que ainda têm espaço.

## Registro de atividade

1. Comprovante: **PDF, JPG ou PNG, até 10 MB** (foto pela câmera ou arquivo). Frente e verso devem ir juntos num PDF.
2. Um serviço de IA lê o comprovante (~20 s) e **sugere o item** e preenche nome, quantidade e data de término. Campos lidos ficam marcados "Lido do certificado, confira".
3. O aluno confirma ("É esse") ou escolhe outro item numa busca.
4. Com o item definido, aparece o painel de regra com a prévia do cálculo.
5. Validação: horas obrigatórias (número); data obrigatória no formato `dd/mm/aaaa`. Se a leitura falhar, o campo fica vazio com mensagem.
6. **Nada é registrado antes de tocar em Registrar.** O botão fica desabilitado até o item ser escolhido.
7. Sucesso mostra "+10h", o item e o novo total.

## Corrigir e remover

- Corrigir permite mudar nome, quantidade, data e item; **o comprovante não muda** (para trocar o arquivo, remove e registra de novo).
- A edição mostra o valor anterior ("Antes: 40") e o novo cálculo ("Vai contar (antes 10,0h) 42,0h"), com aviso quando passa do limite.
- Remover pede confirmação com o impacto no total ("volta de 69h para 59h"), apaga o comprovante e não dá para desfazer.

## Atividades e download

- Atividades agrupadas por item, com "Xh de limite" por grupo.
- "Baixar os que contam": um **.zip com uma pasta por item**, só comprovantes de atividades que contam. Mostra quantidade e tamanho antes ("8 arquivos, cerca de 6,4 MB") e progresso durante.
- "Escolher quais" permite selecionar comprovantes manualmente.
- Erro de download: nada é salvo; sugerir tentar de novo ou baixar um a um pelo Detalhe.

## Formulário (Seu pedido)

- O app **preenche** os 24 itens com as horas que contam (itens sem horas ficam com "–") e o total limitado à meta.
- Pendências: horas abaixo da meta, nome completo, matrícula. Cada pendência leva ao lugar de resolver.
- Pode **pré-visualizar e baixar mesmo incompleto** ("se a coordenação aceitar") e também baixar em branco.
- PDF gerado com cabeçalho "IFCE campus Fortaleza · Coordenação de Engenharia de Computação", aluno, matrícula, tabela Item/Atividade/CH Solicitada, total e "Gerado pelo SAACI em dd/mm/aaaa, hh:mm".
- Depois de baixar: próximo passo "Entregar na coordenação" (pelo SEI ou no protocolo), com o formulário e os comprovantes que contam.

## Conta e acesso

- Login por **e-mail de aluno** (`@aluno.ifce.edu.br`) e senha.
- Senha: **pelo menos 8 caracteres, com uma letra e um número**. Validação ao vivo.
- Criar conta pede só e-mail e senha; curso e semestre vêm depois (fluxo Seu curso, no primeiro login).
- Confirmação de e-mail obrigatória para entrar; reenviar o link só depois de uma contagem (0:45).
- E-mail já cadastrado: oferecer Entrar ou criar uma nova senha (sem revelar mais nada).
- Recuperar senha por link no e-mail; o link expira ou é invalidado por um mais novo. Salvar a senha nova **desconecta os outros aparelhos**.
- Perfil: e-mail (só leitura), matrícula (opcional, vai no formulário), semestre de início, curso, tema (Automático/Claro/Escuro), aviso de privacidade, sair.
- **Trocar de curso fica bloqueado se houver atividades** (remover todas ou apagar a conta).
- Apagar conta: pede a senha, oferece baixar os comprovantes antes, apaga tudo, inclusive das cópias de segurança, em até `[PRAZO DO RNF05]`, e envia confirmação por e-mail.

## Eventos

Aba prevista mas **em construção**: no futuro lista palestras, cursos e eventos que contam horas, com o item e o valor de cada um.
