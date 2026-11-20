# Modelagem de dados

> Alvo (Supabase): implementados só `cursos`, `itens_curso` e `perfis`. O resto vive em mocks em
> memória.

Decisões que vêm dos requisitos. O schema vai viver em `supabase/migrations/` e nos tipos gerados em
`src/@supabase/database.types.ts`; nomes de tabela e coluna nascem na primeira migration, não aqui.
Dado real que falta aparece como marcador visível (`[PRAZO DO RNF05]`), nunca inventado.

## Convenções

| Regra                | Valor                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Tabela e coluna      | português, `snake_case`, tabela no plural                                 |
| Chave primária       | `uuid`                                                                    |
| Horas                | `numeric(6,1)`, nunca `float` (RF14: uma casa decimal, sempre para baixo) |
| Data e hora          | `timestamptz`; data da atividade e semestre em `date`                     |
| Auditoria            | `created_at`, `updated_at`                                                |
| Exclusão             | remoção de verdade, porque RF17 e RF33 pedem apagar, não esconder         |
| Toda tabela do aluno | coluna do dono (`auth.users.id`) + índice                                 |

O código TypeScript continua em inglês; a tradução para o tipo de domínio acontece no service
(`camada-servicos.md`).

## Regras de cálculo são dado, não código

A razão de conversão, o máximo por categoria e os tipos de atividade vivem em tabela de cadastro
(leitura para qualquer aluno logado, escrita só por migration), e não em constante de TypeScript
(RNF21). Um curso novo custa uma migration, e evita o `if (curso === …)` espalhado que só quem
programa consegue alterar. O curso-piloto é Engenharia de Computação; o segundo (Telecomunicações,
RF15) prova que o modelo aguenta mais de uma matriz. `[MÁXIMO POR CATEGORIA]` e
`[RAZÕES DE CONVERSÃO]` vêm de `regras-engenharia-computacao.html`.

## Estado derivado

**Nenhum valor derivado é escrito fora do banco.** Horas computadas de cada atividade, horas que não
contam (RF16) e o total por categoria e geral saem de uma função, View ou RPC únicas (RNF20). O
total geral é arredondado para baixo, em horas inteiras (RF14). Painel, resumo e formulário leem o
mesmo cálculo: uma coluna de horas mantida pela aplicação teria dois escritores, e é assim que o
painel passa a dizer 119h enquanto o formulário diz 120h.

O cálculo depende do semestre de início do perfil: só contam atividades feitas depois do ingresso
(RF38). Mudar o semestre muda o total, por isso a tela avisa antes de salvar (RF11) e a invalidação
do perfil derruba o progresso (`react-query.md`).

A prévia do formulário (RF32) roda no navegador com a mesma conta, e um arquivo de casos prova que
ela dá o mesmo resultado da função SQL (ADR 0003). O valor gravado é sempre o do banco.

## Atividades

- **Datas da atividade (ADR 0003).** Início e fim, com o fim maior ou igual ao início, ambos
  diferentes de quando ela foi lançada (`created_at`). O início decide se conta (RF38: início maior
  ou igual ao semestre de ingresso); o fim ordena a lista; o lançamento ordena quem ocupa o máximo
  do item (RF16).
- **Corrigir, remover e registrar de novo (ADR 0001).** O aluno corrige nome, item, quantidade e
  data; o comprovante não se troca (para usar outro arquivo, remove e registra de novo). A correção
  inclui o `updated_at` lido no `WHERE`: zero linhas afetadas é conflito, não sucesso. A remoção vai
  só pelo id, uma exceção nomeada em `arquitetura.md` (ADR 0011).
- **Item pela FK composta (ADR 0011).** A tabela `atividades` guarda `curso_id` e `item_numero`, com
  FK para `itens_curso (curso_id, numero)`. O curso vem do perfil, copiado por gatilho, e a trava de
  RF10 o mantém.
- **Comprovante repetido é avisado, não bloqueado (RF42).** Por isso o hash do arquivo (SHA-256 em
  hexadecimal, calculado no navegador) fica em coluna comum com índice em
  `(aluno_id, comprovante_hash)`, nunca em `unique`: um `unique` recusaria o que o produto manda só
  avisar.

## Comprovantes

O arquivo vai para um **bucket privado do Storage**, em `<aluno>/<uuid>.<ext>`, e a tabela guarda só
o caminho, o nome enviado, o tipo, o tamanho e o hash. Tipo e tamanho são copiados do `metadata` do
Storage por gatilho, não vêm do navegador. Nunca existe URL pública (RNF04): a tela pede uma URL
assinada, que vale 60 segundos, a cada abertura. Formatos PDF, JPG e PNG (RNF25), até 10 MB (RF31). Os
dois limites ficam no próprio bucket (ADR 0004).

**Salvar completo ou nada (RNF24, ADR 0011).** Storage e Postgres não fazem transação juntos. O
desenho: sobe o arquivo, chama a RPC `registrar_atividade` com o caminho, e ela grava a atividade numa
transação só. O gatilho `prepara_atividade` recusa a atividade cujo arquivo não está no bucket
(`SA024`) ou está na pasta de outro aluno, então nem um `insert` direto grava atividade sem
comprovante. O caminho inverso (gravar primeiro, subir depois) deixaria uma atividade sem
comprovante, o estado que RNF24 proíbe. Na remoção, a linha sai antes do arquivo pelo mesmo motivo.

**Arquivo que sobra.** Se o banco recusar a RPC (erro com código), o service apaga o arquivo na hora.
Se a falha for de rede, o arquivo fica: a resposta pode ter se perdido depois do commit, e apagá-lo
deixaria a atividade sem comprovante. O que escapar (falha de rede, falha na remoção, arquivo que a
remoção da atividade não apagou, conta apagada) a rotina
`limpa-comprovantes` apaga de hora em hora: uma Edge Function chamada pelo `pg_cron`, que pede a
lista a `comprovantes_orfaos` e apaga pela API do Storage. Arquivo com menos de 1 hora fica, porque
pode ser um registro em andamento.

## Perfil

- Tabela `perfis`, com o dono (`aluno_id`) como chave primária e `on delete cascade` para
  `auth.users`. Um gatilho cria a linha no cadastro e a migration cria as das contas antigas
  (ADR 0009).
- Curso e semestre de início são obrigatórios antes do painel (RF09, RF11), e a linha nasce com eles
  nulos no cadastro. A regra vive na tela, não numa constraint, porque a linha precisa existir antes.
- Semestre é `date`, sempre dia 1 de janeiro (`.1`) ou de julho (`.2`), com `check` no mês. Em dois
  inteiros (`ano`, `periodo`) todo filtro de intervalo vira condição composta, ilegível e ruim de
  indexar. `[INÍCIO DO SEMESTRE]` a confirmar com a coordenação.
- **Troca de curso só sem atividades (RF10)** é regra de integridade e vive no banco (gatilho ou RPC
  do perfil), não só na tela: trocar com atividades registradas as deixaria apontando para tipos de
  uma matriz que o aluno não tem mais. É um gatilho em `perfis` que lança `SA010` e chama
  `aluno_tem_atividades`, que olha a tabela `atividades` (ADR 0011).
- O e-mail mora em `auth.users` e o perfil não o duplica. Duas cópias divergem, e a correção de
  e-mail (RF40) teria de escrever nas duas.
- Matrícula é opcional (RF09). `[MATRÍCULA NO PERFIL]` segue a fechar (RNF06): coletar só o
  necessário.

## Conta e exclusão

- **Apagar a conta (RF33)** apaga o usuário, e `on delete cascade` leva perfil e atividades. Aqui o
  cascade é proposital: o dono dos dados pede para apagá-los (LGPD), e linha órfã seria o defeito. Os
  arquivos do Storage **não** saem por cascade: a rotina `limpa-comprovantes` os apaga, na primeira
  hora cheia depois da folga de 1 hora (ADR 0011). `[PRAZO DO RNF05]` diz em quanto tempo tudo some,
  cópias de segurança inclusas.
- **Conta não confirmada (RNF27)** é apagada por rotina agendada depois de 7 dias (ADR 0003).
- Antes de apagar, o aluno pode baixar os comprovantes (RF34). A lista de registros não é exportada
  no MVP.

## Proteções no banco

- `check` de quantidade positiva e de fim igual ou depois do início (`atividades_datas_check`, que o
  service reconhece pelo nome).
- Data da atividade não futura ainda não tem `check`: o formulário não a barra, e o banco devolveria
  um erro que a tela não traduz. Entra junto com a regra na tela (ADR 0011).
- Toda tabela nova nasce com RLS e policy na mesma migration (`rls-e-permissoes.md`).

## Em aberto

- Retenção do backup diário.
