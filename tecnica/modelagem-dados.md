# Modelagem de dados

Decisões e convenções. O schema corrente vive em `supabase/migrations/`
e nos tipos gerados em `src/@supabase/database.types.ts`.

## Convenções

| Regra                       | Valor                                     |
| --------------------------- | ----------------------------------------- |
| Tabela e coluna             | português, `snake_case`, tabela no plural |
| Chave primária              | `uuid`                                    |
| Dinheiro                    | `numeric` — nunca `float`                 |
| Preço unitário              | `numeric(12,4)`                           |
| Total e valores de caixa    | `numeric(12,2)`                           |
| Quantidade                  | `numeric(12,3)`                           |
| Data e hora                 | `timestamptz`                             |
| Auditoria                   | `created_by`, `created_at`, `updated_at`  |
| Exclusão de dado financeiro | soft delete via `deleted_at`              |
| Toda tabela de negócio      | `organization_id` + índice                |

Código TypeScript continua em inglês; a tradução para o tipo de domínio
acontece na camada de service.

## Relações

```
organizations ─┬─ profiles
               ├─ clientes ────── pedidos ──┐
               ├─ produtos ─┬─ variacoes     ├─ pagamento_pedidos
               │            └─ unidades      │
               ├─ locais_venda               │
               ├─ formas_pagamento    pagamentos ─┘
               ├─ categorias_despesa
               └─ despesas
```

## Alocação de pagamento

Pagamento e pedido têm relação N↔N: um pagamento cobre vários pedidos,
um pedido recebe vários pagamentos. Nenhuma das duas tabelas guarda FK
para a outra — a ligação vive em `pagamento_pedidos`, junto com
**`valor_aplicado`**, que registra quanto daquele pagamento foi para
aquele pedido.

Regra de alocação: o pagamento abate o pedido em aberto mais antigo
primeiro, seguindo enquanto sobrar valor. Isso roda dentro de RPC
transacional.

**Não existe "pedido indicado".** O protótipo trazia um campo "Abater de
qual pedido", e ele ficou de fora por decisão (B1): sustentá-lo exigiria
persistir o alvo e afrouxar a terceira conferência da alocação — a que
recusa sobrar crédito enquanto ainda há dívida, e que é justamente a rede
que pega o laço parando cedo. FIFO puro é também o que o extrato da Fase
11 promete por escrito ao cliente.

`pagamentos.observacao` é `text`, nulo, com o mesmo tratamento de
`pedidos.observacao`: espaço em volta normalizado e string vazia virando
nulo, na RPC. É o que faz `observacao is not null` significar "tem
observação" na tela.

## Estado derivado

| Valor                  | Como existe                                             |
| ---------------------- | ------------------------------------------------------- |
| `valor_pago` do pedido | coluna mantida pela RPC, na mesma transação da alocação |
| Status do pedido       | coluna gerada a partir de `valor_pago` e `total`        |
| Crédito do cliente     | derivado: pagamentos menos o que foi alocado deles      |

Nenhum estado financeiro é escrito fora de RPC.

**O crédito é consumido no lançamento do pedido seguinte** (Fase 10.1). As
quatro RPCs que mexem em dinheiro distribuído — `salvar_pedido`,
`atualizar_pedido`, `remover_pedido` e `registrar_pagamento` — terminam
chamando `realocar_pagamentos_do_cliente`, então um pedido lançado para quem
tem crédito já nasce parcialmente pago, na mesma transação.

Até a Fase 10.1 `salvar_pedido` estava fora dessa lista, e o efeito era pior
que a ausência dele: o crédito era consumido assim mesmo, mas só na próxima
escrita qualquer naquele cliente. Entre um momento e outro o cliente ficava
com crédito **e** dívida ao mesmo tempo — o estado que a conferência `LID36`
recusa quando é ela quem o produz. Hoje esse estado não é alcançável, e a
invariante vale para o sistema inteiro.

## Concorrência otimista (Fase 7)

Toda tabela editável (as que têm `updated_at`, exceto `pedido_itens` e
`pagamento_pedidos` — linha/junção sem edição própria) tem o trigger
`set_updated_at_trigger`, que grava `now()` em `updated_at` a cada
`UPDATE`. É o marcador de versão que `arquitetura.md` já exigia
("zero linhas afetadas é conflito de concorrência, não sucesso"): o
service inclui `updated_at` no `WHERE` da escrita, e se outra pessoa
gravou antes, o filtro não bate — nenhum erro, só zero linhas, que o
service traduz em `ConflitoDeEdicaoError` (ver `camada-servicos.md`).

`updated_by` existe em `clientes` (Fase 7) e `produtos` (Fase 8) — não é
padrão universal ainda, entra tabela por tabela conforme a tela que a
edita precisa nomear quem gravou por último. As três listas
administráveis do catálogo (`locais_venda`, `formas_pagamento`,
`categorias_despesa`) não têm: a edição ali é de um campo só (renomear em
linha), e o conflito de edição usa mensagem genérica de propósito.

## Unicidade insensível a caixa e acento (Fase 7)

`clientes` tem índice único sobre `(organization_id,
lower(imutavel_unaccent(nome)))`, não sobre `nome` cru — "Mercado do
Zé", "mercado do ze" e "MERCADO DO ZE" contam como o mesmo cliente.

`imutavel_unaccent` é um wrapper `immutable` sobre a `unaccent()` nativa
do Postgres (que é só `stable`, porque em tese o dicionário configurado
pode mudar — na prática, ninguém troca). Índice sobre expressão exige
`immutable`; o wrapper _afirma_ essa garantia sem o Postgres poder
verificá-la. Risco aceito, registrado aqui: se o dicionário `unaccent`
for trocado um dia, o índice fica inconsistente até um `REINDEX`.

A Fase 8 estendeu a mesma regra às seis tabelas do catálogo: `produtos`
ganhou o índice que nunca teve, e `variacoes`, `unidades`, `locais_venda`,
`formas_pagamento`, `categorias_despesa` tiveram o índice existente
recriado sobre `lower(imutavel_unaccent(nome))` no lugar de `nome` cru —
até ali, "Graúdo" e "graudo" contavam como duas variações diferentes.
Uma regra de unicidade só no sistema inteiro, não duas convivendo.

## Catálogo (Fase 8)

Seis tabelas — `produtos`, `variacoes`, `unidades`, `locais_venda`,
`formas_pagamento`, `categorias_despesa` — desde a Fase 3, com regra e
tela entregues na Fase 8.

**Remoção é sempre soft delete.** "Excluir" tira o item das próximas
escolhas (`deleted_at`), nunca apaga a linha — o histórico que a
referencia continua resolvendo o nome. Diferente de `clientes` (Fase 7),
que usa hard delete com o banco recusando quem tem histórico: lá a
exclusão é rara e definitiva; aqui, "Feira Livre" sair da lista de locais
não pode invalidar um pedido antigo que vendeu lá.

**`unidades` continua sendo uma linha por produto, com nome livre** — o
schema não mudou. O que mudou foi a tela: o dono não digita o nome, só
liga/desliga sete opções fixas (`kg`, `unidade`, `litro`, `caixa`,
`dúzia`, `maço`, `saca`, em `src/constants/unidades.ts`), e a RPC
`salvar_produto` sincroniza as linhas — ligar cria (ou reativa, se havia
uma soft-deletada), desligar faz soft delete. Continua não existindo
conversão entre unidades em lugar nenhum do sistema.

**Unidade e variação são as duas obrigatórias.** Todo produto precisa de
ao menos uma unidade e ao menos uma variação — a RPC recusa as duas
ausências (`LID01` sem unidade, `LID02` sem variação), e essa garantia
vive no banco, não só no formulário. `pedido_itens.variacao_id` continua
nulo no schema (Fase 3) e continua podendo ficar em branco **num item de
pedido específico** — a obrigatoriedade é do cadastro do produto ter
pelo menos uma variação definida, não de toda venda escolher uma.

**`salvar_produto(p_nome, p_unidades, p_id, p_variacoes, p_updated_at)`**
grava o produto e sincroniza suas unidades/variações numa transação só —
três escritas soltas do service deixariam um produto sem unidade se a
conexão caísse no meio, inutilizável na Fase 9 sem sintoma nenhum no
catálogo. `security invoker`: obedece as policies de
`produtos`/`unidades`/`variacoes` sem checagem própria, ao contrário da
RPC de alocação de pagamento da Fase 10, que precisa ser `definer`.

A sincronização compara nomes sempre normalizados
(`lower(imutavel_unaccent(...))`), nunca crus — achado do próprio teste
desta fase (`05_catalogo_fase8.test.sql`, T11c): o seed tinha uma unidade
gravada como "Caixa" antes de D8 fixar o vocabulário em minúsculo; com
comparação crua, a primeira edição pela tela nova (que só oferece
"caixa") soft-deletava a linha antiga e recriava outra, desligando o
histórico de uso da RPC sem erro nenhum. A RPC reconhece a linha
existente por igualdade normalizada e nunca a renomeia — só o índice
único é quem decide identidade.

**Provisionamento dividido por quem é dono do vocabulário (decisão
D10).** Toda organização nova nasce com `formas_pagamento` (Dinheiro,
Pix, Transferência, Débito) e `categorias_despesa` (Insumo, Combustível,
Mão de obra, Embalagem, Manutenção, Frete) já cadastradas — vocabulário
comum, provisionado pelo mesmo gatilho que já cria o cliente "Avulso"
(`criar_perfil_no_cadastro`, Fase 4). `produtos` e `locais_venda` nascem
vazios: são vocabulário da fazenda, e pré-preencher entregaria uma lista
de exemplos que a organização teria de apagar antes de usar.
"Prazo (fiado)" não é forma de pagamento — é a ausência de uma;
a dívida do cliente é representada pelo pedido em aberto, não por um
pagamento sem dinheiro nenhum tendo entrado.

O que acontece se essa regra for quebrada (o protótipo da Tela 07 a
quebra, e a correção está anotada para a Fase 10): lançar um pagamento
com forma "fiado" cria um pagamento **de verdade**, com valor, sem
dinheiro nenhum ter entrado. A alocação da Fase 10 então o distribui
pelos pedidos em aberto do cliente, marca-os como pagos e zera a dívida.
O cliente continua devendo e a tela diz que está quitado — e quem lê isso
é a Fase 12, a tela de "quem está devendo". Nenhum erro aparece em
lugar nenhum.

A forma certa de registrar uma venda fiado já existe e é não fazer nada:
o pedido nasce em aberto, e o pagamento só é lançado quando o dinheiro
entrar. É por isso que o formulário de pedido (Fase 9) não pergunta forma
de pagamento.

## Pedidos (Fase 9)

`pedidos.numero` é `bigint not null`, único por `(organization_id,
numero)`. Existe porque ninguém lê um uuid em voz alta no telefone: é o
`#482` que a lista mostra, que a busca aceita e que Pagamentos (Fase 10)
usa para apontar para a venda.

O número sai de um **contador por organização**
(`organizations.proximo_pedido`), não de uma sequence. Sequence global
faria cada fazenda ver os próprios números pularem — os do meio foram
para outras organizações —, o que confunde e vaza volume agregado.
Sequence por organização resolveria, mas exigiria `create sequence` em
tempo de execução, com DDL nascendo fora de migration.

O preço do contador é real e está aceito: `update ... returning` tranca a
linha da organização até a transação fechar, então dois lançamentos
simultâneos da **mesma** fazenda esperam um ao outro. Na escala desta
aplicação (dezenas de pedidos por dia, por fazenda) a espera é de
milissegundos; num sistema de milhares de escritas por segundo seria
gargalo. Organizações diferentes não se esperam — o lock é da linha.

Quem atribui é o trigger `atribuir_numero_pedido` (`before insert`), e
não a RPC, por dois motivos. `organizations` tem `grant select` e nada
mais (Fase 5), então um `update` ali dentro de função `security invoker`
seria recusado no privilégio de tabela; e como trigger, o número vale
para todo caminho de escrita — seed, correção manual, e as RPCs das fases
seguintes — sem que nenhum precise saber que a coluna existe. O trigger é
`security definer`, exceção nomeada bem menor que a da Fase 10: não
recebe parâmetro, lê a organização da própria linha, toca uma coluna só.

**O número não volta ao contador quando o pedido é removido.**
Reaproveitá-lo faria duas vendas diferentes atenderem por "#482" no
histórico — e a primeira continua existindo, soft-deletada. O buraco na
numeração é a informação correta: houve um pedido ali.

`pedidos.observacao` é `text`, nulo — o combinado da venda que não cabe em
nenhum outro campo ("entregar na segunda de manhã, portão dos fundos").
Espaço em volta é normalizado e string vazia vira nulo, na RPC.

`local_venda_id` **continua nulo no schema**, e a obrigatoriedade vive na
RPC (`LID21`). A regra é de produto ("queremos que o funcionário sempre
informe"), não de integridade — e regra de produto muda, enquanto
constraint com dado gravado exige migration para afrouxar. Existe também
histórico de planilha sem local anotado, que um `set not null` fecharia a
porta para importar.

### As quatro funções

`salvar_pedido(p_cliente_id, p_local_venda_id, p_itens, p_data_venda,
p_observacao)` grava pedido e itens numa transação só — exigência da
policy `pedido_itens_insert`, que só aceita item de funcionário em pedido
nascido na transação corrente. **Nenhuma delas tem bloco `exception
when`**: ele abriria subtransação, a linha do pedido nasceria com o xid
dela, e a comparação com `pg_current_xact_id()` recusaria todos os itens
no caminho feliz.

O total é calculado **antes** do insert do pedido, a partir dos mesmos
números que vão para os itens. O caminho óbvio (inserir com total 0 e
fechar com `update`) falharia para o funcionário, e falharia em silêncio:
sem policy de update, o comando afeta zero linhas sem erro, e o pedido
ficaria gravado com total zero. No fim, a RPC confere `sum(subtotal)`
contra o total gravado (`LID24`) — sobra de centavo aqui vira dinheiro
errado que só aparece meses depois.

`atualizar_pedido` e `remover_pedido` são do dono. As duas checam
`papel_atual()` e lançam `LID25` — não para autorizar (quem autoriza é a
policy), mas porque a recusa do RLS é silenciosa: sem o `raise`, a tela do
funcionário mostraria "Pedido salvo" com nada gravado. Corrigir um pedido
**não sobrescreve** os itens: os antigos levam soft delete, porque preço
e quantidade cobrados antes da correção são histórico financeiro. As duas
recusam pedido com pagamento (`LID26`/`LID27`) — realocar dinheiro é
entrega da Fase 10.

`listar_pedidos` e `resumir_pedidos` compartilham o predicado via
`pedidos_filtrados`, para o filtro não divergir entre a lista e o KPI. O
filtro por produto/variação é `exists`, nunca join: com join, um pedido
com dois itens do mesmo produto apareceria duas vezes e a contagem da
paginação sairia errada sem sintoma. `resumir_pedidos` não tem
`limit`/`offset` de propósito — é a diferença entre "total dos pedidos" e
"total desta página".

## Multi-tenant

`organization_id` em toda tabela de negócio, com índice. É a coluna que
todas as policies filtram, e cliente pertence a uma organização só — não
há cadastro compartilhado entre fazendas.

## Proteções no banco

- `ON DELETE RESTRICT` entre cliente e pedido: o banco recusa apagar
  cliente com histórico.
- Registro criado pelo sistema (como o cliente usado em venda sem
  identificação) é marcado por flag e não pode ser removido nem
  renomeado.
- `check` de valor positivo em quantidade, preço e valor aplicado.
- Item de lista administrável já usado não é removido de forma que
  altere registro histórico.

## Clientes — contato e região (Fase 7)

`clientes.contato` e `clientes.regiao` são `text`, nulos. `contato`
guarda só dígitos — formatação é responsabilidade da UI
(`formatTelefone`, `src/utils/`), nunca do banco. `regiao` é texto
livre (decisão de produto: lista administrável fica para quando algum
relatório precisar agrupar por região, não antes). Nenhum dos dois
existe para o cliente `eh_sistema` — a UI mostra texto descritivo
("Venda sem identificar quem comprou") no lugar, não campo vazio.

## Competência da despesa

A coluna existe desde a Fase 13
(`20260814090000_despesas_colunas.sql`). Ela ficou registrada aqui como
pendente desde a Fase 3, quando a decisão fechou sem a migration.

`despesas.mes_competencia` é `date not null`, sempre no dia 1 do mês, com
`check (extract(day from mes_competencia) = 1)`. Responde a **qual mês o
gasto pertence**, que nem sempre é o mês em que o dinheiro saiu — o caso
relatado pela cliente é "comprei hoje, mas usei o dinheiro do mês
passado". `data_despesa` continua sendo quando saiu, e continua sendo o
eixo do caixa; as duas colunas coexistem e respondem perguntas
diferentes.

A coluna existe por causa de um processo real: a cliente **fecha o mês e
confere o resultado**. É esse fechamento que precisa contar o
gasto no mês certo — não o caixa do dia a dia. Sem a coluna, a única
saída dela seria mentir na data da compra para o número fechar.

`date` no dia 1, e não `mes int` + `ano int`: com dois inteiros, todo
filtro de intervalo vira `(ano > x or (ano = x and mes >= y))` — ilegível
e ruim de indexar. Como `date`, `between` resolve, a ordenação é natural,
e um índice `(organization_id, mes_competencia)` serve filtro e
agrupamento. O `check` é o que impede um dia solto de quebrar o
`group by`.

Não é coluna gerada a partir de `data_despesa`: o ponto da coluna é
justamente poder divergir dela. O default (`date_trunc('month', now())`)
cobre o caso comum sem exigir nada de quem lança.

**Quem grava é a RPC, e ela usa `p_data_despesa`, não `now()`.**
`registrar_despesa` e `atualizar_despesa` calculam
`date_trunc('month', p_data_despesa)::date` quando o mês não vem
explícito. O default da coluna continua existindo como rede para escrita
direta, mas a diferença entre os dois aparece na virada do mês — alguém
lança no dia 2 uma compra do dia 30 —, e com `now()` o gasto cairia no
fechamento seguinte sem sintoma nenhum até o mês ser fechado. O caso D7
da bateria da Fase 13 é o que trava isso.

Nenhum outro dado tem competência — ver `decisoes.md`. Quem **agrega** por
competência é uma tela só (Fechamento do mês); todo o resto, inclusive
relatório e caixa, agrega por `data_despesa`. Consulta agregada nova
precisa escolher um dos dois explicitamente — nunca misturar os dois na
mesma resposta.

**Filtrar pelos dois ao mesmo tempo é outra coisa, e é permitido.** A
lista de Despesas (Fase 13) tem "Período" (sobre `data_despesa`) e "Mês de
referência" (sobre `mes_competencia`), ligados por `and`. O resultado é a
interseção: um conjunto e um total. A proibição acima é sobre produzir
dois totais rivais na mesma tela, não sobre cruzar recortes.

## Não herdado do sistema anterior

Competência **na receita** não existe aqui: a alocação por pedido já
responde a que venda cada valor pertence. O recorte é só da receita — a
despesa não tem alocação equivalente, e por isso ganhou competência
própria (seção acima).

## Capacidades individuais

`profiles.pode_lancar_pagamento` e `profiles.pode_lancar_despesa` —
`boolean not null default false`, independentes entre si. Não são lidas
da tabela dentro de policy nenhuma; viram claim do JWT pelo Auth Hook, no
mesmo padrão de `papel`/`organization_id`. Detalhe: `doc/rls-e-permissoes.md`.

A partir da Fase 16 elas também podem chegar pela metadata do cadastro,
lidas pelo gatilho `criar_perfil_no_cadastro`. O motivo é atomicidade: a
tela de "Criar acesso" já vem com as duas decididas, e um `update` logo
depois do cadastro poderia falhar sozinho — sobraria funcionário com
permissão diferente da escolhida, sem ninguém avisar.

## Perfil: e-mail e revogação (Fase 16)

Duas colunas em `profiles`, ambas nascidas com a tela de equipe.

**`email text not null`, único global sobre `lower(email)`.** É um
espelho de `auth.users.email`, que nenhuma policy nossa alcança — ler o
e-mail de outra pessoa por lá exigiria a Admin API, e trocaria a proteção
real (`profiles_select_dono`) por um `if` escrito à mão dentro de um
Route Handler.

A unicidade é global, e não por organização, porque o GoTrue já recusa o
segundo cadastro do mesmo e-mail no projeto inteiro. Um índice por
`(organization_id, email)` seria mais frouxo do que a realidade que
espelha: nunca dispararia, e afirmaria em SQL uma regra que o sistema não
tem. Sem `imutavel_unaccent` aqui, ao contrário de nome de cliente ou
produto — e-mail com acento não é o mesmo endereço escrito de outro
jeito, é outro endereço.

O custo normal da denormalização — dois lugares que podem divergir — **não
existe aqui**, e a razão é de produto: acesso criado não é editado. Nome e
e-mail ficam como foram cadastrados; o que muda depois são as duas
capacidades, pelo interruptor da lista. Não há tela nem endpoint de
edição, então a única escrita nos dois lados acontece no cadastro, dentro
da mesma transação do gatilho.

O único caminho que ainda pode fazê-los divergir é a edição direta pelo
Studio — anotada em `doc/provisionamento-manual.md`.

**`senha_definida_em timestamptz`, nula = a senha em uso não é dela.**
Todo perfil nasce com ela nula: quem opera o Lida escolhe a senha do dono
no Studio, e o dono escolhe a do funcionário na tela. O Auth Hook emite
isso como `precisa_trocar_senha` e o `proxy.ts` segura a pessoa em
`/trocar-senha`. A migration preenche os perfis que já existiam — obrigar
quem já usa o sistema a trocar uma senha que já era dele seria punir pelo
retrofit.

Guarda a **data**, e não um booleano `precisa_trocar`: os dois diriam a
mesma coisa hoje, e só um responde "faz quanto tempo esta senha é dela?"
quando a pergunta aparecer.

**`acesso_removido_em timestamptz`, nula enquanto o acesso vale.** Mesmo
padrão de soft-delete de `organizations.pausada_em`. Revogar não pode ser
`delete`: `created_by` mantém `on delete restrict` com todo o histórico.
O efeito da coluna acontece no Auth Hook, não em policy por tabela —
`doc/rls-e-permissoes.md` explica por quê.

## Limite de funcionários (Fase 16)

`organizations.limite_funcionarios integer not null default 1`, com
`check (>= 0)`.

É teto de pessoas **ativas**, não contador de quantas já existiram:
revogar um acesso libera a vaga na hora. Sem isso, uma fazenda que
trocasse de funcionário três vezes precisaria de três acessos para ter
um — e a conversa comercial começaria por um erro.

**Coluna, e não constante em código**, porque o número é alavanca
comercial: subir o limite de uma fazenda é uma célula no Studio, não um
deploy. O padrão de fábrica (1) é espelhado em
`src/constants/assinatura.ts` apenas para a copy poder dizer "a
assinatura inclui 1 funcionário" sem consultar nada — quem manda é o
banco.

A trava vive no gatilho `criar_perfil_no_cadastro` (`LID70`), o único
lugar por onde toda criação passa. Detalhe em `doc/rls-e-permissoes.md`.

## Contas a receber (Fase 12)

Nenhuma tabela nova, nenhuma coluna nova: dívida continua sendo
`total - valor_pago` e crédito continua derivado. O que a fase acrescenta
são cinco funções e dois índices parciais
(`20260813090000_contas_a_receber.sql`).

`saldos_dos_devedores()` é o predicado compartilhado — uma linha por
cliente devedor, com o pedido mais antigo ainda em aberto (`distinct on
(cliente_id)`, mesma ordem `(data_venda, numero)` da cascata FIFO) e os
dias parados desde ele, contados em `America/Sao_Paulo`. `listar_devedores`
e `resumir_contas_a_receber` partem daí, para o cartão do topo e a soma da
tabela não terem como divergir.

**O ritmo de pagamento, que estava pendente desde a Fase 9, é a mediana do
intervalo entre pagamentos consecutivos nos últimos 12 meses** —
`percentile_cont(0.5)` sobre `lag(data_pagamento)`. Mediana e não média
porque uma ausência longa não pode reescrever o hábito do cliente: é
justamente ela que a tela precisa acusar. Janela de 12 meses porque ritmo é
sinal de comportamento atual.

`quantos_pagamentos` vem na mesma função e conta o histórico **inteiro**,
sem a janela. As duas medidas respondem perguntas diferentes: o ritmo diz
"a cada quantos dias", a contagem escolhe a frase quando não há ritmo
(nunca pagou · só um pagamento · sem pagamento no último ano). Unificar as
duas faria "nunca pagou" aparecer sobre quem pagou dez vezes em 2024.

A severidade (`ritmo × 1,2`, `× 2`) **não** está no banco: as funções
devolvem fatos, e a régua que os transforma em cor vive na tela, onde muda
sem migration.

Acesso é dono-only por `contas_a_receber_exige_dono()` (LID50), e não só
por RLS — pelo mesmo motivo do extrato: o funcionário não enxerga
pagamento, então uma consulta `invoker` pura lhe daria toda venda em aberto
pelo valor cheio. Parcial é pior que vazio, porque parece completo.

## Pendências

- Estratégia de retenção do backup diário.
- Competência na receita — só se a cliente relatar o mesmo caso na venda.
