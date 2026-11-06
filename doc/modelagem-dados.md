# Modelagem de dados

> Alvo (Supabase): nada deste documento está implementado. Hoje os dados vivem em mocks em memória
> .
>
> Os nomes de tabela e coluna são proposta derivada dos requisitos (RF/RNF) e das regras do Lida. O
> que é decisão firme está em `tecnologia.md`. O resto vira regra quando a primeira migration for revisada.

Decisões e convenções. O schema corrente vai viver em `supabase/migrations/` e nos tipos gerados em
`src/@supabase/database.types.ts`. Este documento registra o **porquê**, não a lista de colunas.

Dado real que falta aparece como marcador visível (`[PRAZO DO RNF05]`), nunca inventado.

## Convenções

| Regra                | Valor                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Tabela e coluna      | português, `snake_case`, tabela no plural                                 |
| Chave primária       | `uuid`                                                                    |
| Horas                | `numeric(6,1)`, nunca `float` (RF14: uma casa decimal, sempre para baixo) |
| Data e hora          | `timestamptz`; data de atividade e semestre em `date`                     |
| Auditoria            | `created_at`, `updated_at`                                                |
| Exclusão de registro | hard delete, porque RF17 e RF33 pedem remoção de verdade, não escondida   |
| Toda tabela do aluno | `aluno_id` (= `auth.users.id`) + índice                                   |

`[PRECISÃO DAS HORAS]` fica a confirmar com `regras-engenharia-computacao.html` quando as regras de
conversão forem modeladas.

Código TypeScript continua em inglês; a tradução para o tipo de domínio acontece na camada de
service (`camada-servicos.md`).

## Relações

```
auth.users ── perfis ──┬─ atividades ── comprovantes (Storage, <uid>/…)
                       │       │
                       │       └── tipo_atividade ── categorias ── regras_curso
                       └─ curso
```

- `perfis` é 1:1 com `auth.users`, criado por gatilho no cadastro (RF01 a RF04).
- `cursos` e `regras_curso` são cadastro: leitura para qualquer aluno autenticado, escrita só por
  migration (RF15, RNF21).
- `atividades` pertence a um aluno e a um tipo de atividade de uma regra de curso.

## Regras de cálculo como dado

RNF21 pede regras parametrizáveis **sem alterar o código-fonte**. Por isso a razão de conversão, o
máximo por categoria e o nome da categoria vivem em tabela (`regras_curso`, `categorias`,
`tipos_atividade`), e não em constante de TypeScript. O curso-piloto é Engenharia de Computação, e o
segundo curso (Engenharia de Telecomunicações, RF15) existe para provar que o modelo aguenta mais de
uma matriz.

Trocar de constante para tabela custa uma migration por curso novo, e evita o outro caminho, que é
um `if (curso === …)` espalhado pelo código e uma regra que só quem sabe programar altera.

## Estado derivado

| Valor                             | Como existe                                                           |
| --------------------------------- | --------------------------------------------------------------------- |
| Horas computadas de uma atividade | função SQL, a partir da regra do tipo e do semestre de início         |
| Horas que não contam (RF16)       | derivado: registradas menos computadas, depois do máximo da categoria |
| Total por categoria e total geral | View ou RPC única (RNF20), nunca coluna escrita pela tela             |
| Total geral                       | arredondado para horas inteiras, sempre para baixo (RF14)             |

**Nenhum valor derivado é escrito fora do banco.** Painel (RF16), resumo (RF35) e formulário (RF37)
leem o mesmo cálculo. Uma coluna `horas_computadas` mantida pela aplicação teria dois escritores, e é
assim que o painel passa a dizer 119h enquanto o formulário diz 120h.

Dependem do semestre de início do perfil: só contam atividades feitas depois do ingresso (RF38).
Mudar o semestre muda o total, e por isso a tela avisa antes de salvar (RF11) e a invalidação do
perfil derruba o progresso (`react-query.md`).

`[MÁXIMO POR CATEGORIA]` e `[RAZÕES DE CONVERSÃO]` vêm de `regras-engenharia-computacao.html`.

## Atividades

`atividades.data_atividade` é `date not null`: a data em que a atividade **terminou** (RF38). Não é a
data do registro, que é `created_at`. As duas respondem perguntas diferentes: a primeira decide se a
atividade conta, a segunda diz quando o aluno a lançou.

**Registrar e remover, nunca editar (RF17).** Para corrigir, o aluno remove e registra de novo. Isso
tira da tabela de atividades a necessidade de concorrência otimista, e é uma decisão de produto
registrada no requisito. A edição entra se o produto a pedir, e nesse dia a tabela ganha o trigger
`set_updated_at` e a escrita passa a incluir `updated_at` no `WHERE`: zero linhas afetadas é
conflito, não sucesso.

**Comprovante repetido não é bloqueado, é avisado (RF42).** Arquivo idêntico, ou mesmo nome e data
de uma atividade existente, avisa antes do envio; o aluno decide. Por isso não existe índice único
sobre o hash do arquivo: um `unique` recusaria o que o produto manda apenas avisar. O hash vive numa
coluna comum com índice, e o aviso é uma consulta.

## Comprovantes

O arquivo vai para um **bucket privado do Storage**, na pasta do dono (`<uid>/<atividade_id>/…`), e
a tabela guarda só o caminho, o tipo e o tamanho. Nunca existe URL pública (RNF04): a tela pede uma
URL assinada, de vida curta, a cada abertura.

PDF, JPG e PNG (RNF25). `[TAMANHO MÁXIMO DO COMPROVANTE]`: o design fixou 10 MB, a confirmar no
SAACI-produto (RF31).

**Salvar completo ou nada (RNF24).** O upload e a gravação da atividade são dois sistemas (Storage e
Postgres), e nenhum dos dois faz transação com o outro. O desenho é: sobe o arquivo, chama a RPC com
o caminho, e a RPC grava atividade e referência numa transação só. Se a RPC falhar, sobra um arquivo
sem dono, e uma rotina agendada o limpa. O caminho inverso (gravar primeiro e subir depois) deixaria
uma atividade sem comprovante, que é exatamente o estado que RNF24 proíbe.

## Perfil

`perfis.curso_id` e `perfis.semestre_inicio` são obrigatórios depois do primeiro login: o aluno só
segue para o painel depois de informar os dois (RF09, RF11). Antes disso a linha existe com os
campos nulos, o que obriga o `not null` a ser aplicado por regra de tela e por `check` condicional,
e não por constraint simples.

`semestre_inicio` é `date`, sempre no dia 1 de janeiro (`.1`) ou de julho (`.2`), com `check` no mês.
Com `ano int` + `periodo int`, todo filtro por intervalo vira `(ano > x or (ano = x and periodo >=
y))`, ilegível e ruim de indexar. Como `date`, `>=` resolve e a ordenação é natural. `[INÍCIO DO
SEMESTRE]` (janeiro e julho) está a confirmar com a coordenação.

`matricula` é opcional (RF09) e `text`. `[MATRÍCULA NO PERFIL]` segue pendente (RNF06): coletar só o
necessário.

**Troca de curso (RF10).** O curso só pode ser trocado enquanto o aluno não tiver nenhuma atividade.
Isso é regra de integridade, não de tela: vive no banco, num `check` por gatilho ou na RPC que
atualiza o perfil. Trocar o curso com atividades registradas deixaria atividades apontando para tipos
de uma matriz que o aluno não tem mais.

**E-mail.** O e-mail mora em `auth.users`. `perfis` não o duplica: nenhuma policy nossa alcança
`auth.users`, mas o aluno lê o próprio e-mail pela sessão. Duplicá-lo criaria dois lugares que podem
divergir, e a correção de e-mail (RF40) escreveria nos dois.

## Conta, exclusão e conta não confirmada

- **Apagar a conta (RF33)** apaga a linha de `auth.users`, e `on delete cascade` leva `perfis` e
  `atividades`. Os arquivos do Storage não saem por cascade: uma rotina os apaga, e a conta só conta
  como apagada quando os dois lados terminaram. `[PRAZO DO RNF05]` diz em quanto tempo os dados
  somem, inclusive cópias de segurança.
- **Conta não confirmada (RNF27)** é apagada por rotina agendada depois de `[PRAZO DO RNF27]`,
  junto com o e-mail cadastrado. A rotina filtra por `email_confirmed_at is null` e idade da conta.
- Antes de apagar, o aluno pode baixar os comprovantes (RF34). A lista de registros não é exportada
  no MVP.

`on delete cascade` aqui é **proposital**, ao contrário do que se faz com dado de terceiros: o dono
dos dados está pedindo para apagá-los (LGPD), e uma exclusão que deixasse linhas órfãs seria o
defeito.

## Proteções no banco

- `check` de horas positivas e de data de atividade não futura.
- `unique (aluno_id, …)` onde o produto diz "um por aluno" (perfil).
- Tabela de regra de curso não tem policy de escrita para `authenticated`: só migration altera.
- Toda tabela nova nasce com RLS e policy na mesma migration (`rls-e-permissoes.md`).

## Pendências

- Estratégia de retenção do backup.
- Onde o cálculo de horas executa para a prévia do formulário (RF32): na RPC, a cada digitação, ou no cliente com um teste que prove a igualdade com o SQL (RNF20).
