# Modelagem de dados

> Alvo (Supabase): nada deste documento está implementado. Hoje os dados vivem em mocks em memória.

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

## Atividades

- **Data da atividade** é quando ela **terminou** (RF38), não quando foi lançada (`created_at`). A
  primeira decide se conta; a segunda, quando o aluno a registrou.
- **Corrigir, remover e registrar de novo (ADR 0001).** O aluno corrige nome, item, quantidade e
  data; o comprovante não se troca (para usar outro arquivo, remove e registra de novo). Toda escrita
  inclui o `updated_at` lido no `WHERE`: zero linhas afetadas é conflito, não sucesso.
- **Comprovante repetido é avisado, não bloqueado (RF42).** Por isso o hash do arquivo fica em coluna
  comum com índice, nunca em `unique`: um `unique` recusaria o que o produto manda só avisar.

## Comprovantes

O arquivo vai para um **bucket privado do Storage**, na pasta do dono, e a tabela guarda só o
caminho, o tipo e o tamanho. Nunca existe URL pública (RNF04): a tela pede uma URL assinada, de vida
curta, a cada abertura. Formatos PDF, JPG e PNG (RNF25); `[TAMANHO MÁXIMO DO COMPROVANTE]`: o design
fixou 10 MB, a confirmar (RF31).

**Salvar completo ou nada (RNF24).** Storage e Postgres não fazem transação juntos. O desenho: sobe o
arquivo, chama a RPC com o caminho, e a RPC grava atividade e referência numa transação só. Se a RPC
falhar, sobra um arquivo sem dono, e uma rotina agendada o limpa. O caminho inverso (gravar primeiro,
subir depois) deixaria uma atividade sem comprovante, o estado que RNF24 proíbe.

## Perfil

- Curso e semestre de início são obrigatórios antes do painel (RF09, RF11), e a linha nasce com eles
  nulos no cadastro. A regra vive na tela e num `check` condicional, não numa constraint simples.
- Semestre é `date`, sempre dia 1 de janeiro (`.1`) ou de julho (`.2`), com `check` no mês. Em dois
  inteiros (`ano`, `periodo`) todo filtro de intervalo vira condição composta, ilegível e ruim de
  indexar. `[INÍCIO DO SEMESTRE]` a confirmar com a coordenação.
- **Troca de curso só sem atividades (RF10)** é regra de integridade e vive no banco (gatilho ou RPC
  do perfil), não só na tela: trocar com atividades registradas as deixaria apontando para tipos de
  uma matriz que o aluno não tem mais.
- O e-mail mora em `auth.users` e o perfil não o duplica. Duas cópias divergem, e a correção de
  e-mail (RF40) teria de escrever nas duas.
- Matrícula é opcional (RF09). `[MATRÍCULA NO PERFIL]` segue a fechar (RNF06): coletar só o
  necessário.

## Conta e exclusão

- **Apagar a conta (RF33)** apaga o usuário, e `on delete cascade` leva perfil e atividades. Aqui o
  cascade é proposital: o dono dos dados pede para apagá-los (LGPD), e linha órfã seria o defeito. Os
  arquivos do Storage **não** saem por cascade: uma rotina os apaga. `[PRAZO DO RNF05]` diz em
  quanto tempo tudo some, cópias de segurança inclusas.
- **Conta não confirmada (RNF27)** é apagada por rotina agendada depois de `[PRAZO DO RNF27]`.
- Antes de apagar, o aluno pode baixar os comprovantes (RF34). A lista de registros não é exportada
  no MVP.

## Proteções no banco

- `check` de horas positivas e de data da atividade não futura.
- Toda tabela nova nasce com RLS e policy na mesma migration (`rls-e-permissoes.md`).

## Em aberto

- Retenção do backup diário.
- Onde o cálculo roda para a prévia do formulário (RF32): na RPC a cada digitação, ou no cliente com
  um teste que prove a igualdade com o SQL (RNF20).
