# Testes

Qual arnês usar para qual tipo de afirmação, e quando um teste é entrega
obrigatória de uma fase — não como escrever um teste de componente (isso
está em `convencoes-codigo.md`, seção Testes).

## Os três arnêses

| Arnês                      | Onde                                                                  | Comando         | Precisa de quê                          |
| -------------------------- | --------------------------------------------------------------------- | --------------- | --------------------------------------- |
| Vitest (componente/lógica) | `src/**/*.test.ts(x)` (co-localizado) e `tests/*.test.ts` (repo-wide) | `pnpm test`     | nada — roda em `jsdom`, isolado         |
| pgTAP (RLS)                | `supabase/tests/database/*.test.sql`                                  | `pnpm test:db`  | Supabase local de pé (`supabase start`) |
| Vitest de integração       | `tests/integration/**/*.test.ts`                                      | `pnpm test:rls` | Supabase local de pé, login real        |

`tests/*.test.ts`, direto na pasta (sem subpasta `integration/`), é para teste que não tem um arquivo pra co-localizar — verifica uma regra sobre o repositório inteiro, não um módulo (exemplo: `tests/service-role-key.test.ts`, Fase 5). Ainda roda no arnês padrão (`pnpm test`), só não mora dentro de `src/`.

### Por que dois arnêses de banco, não um

pgTAP simula a claim do usuário com `set local request.jwt.claims` —
roda dentro do banco, cobre uma matriz densa (14 tabelas × papéis) rápido,
mas **finge** o JWT. Se o que o Auth Hook realmente emite divergir do que
o teste finge, o teste passa verde e a produção vaza.

A integração loga de verdade (`signInWithPassword`) e prova a cadeia
inteira — mais lenta, cobre menos casos, mas o que ela prova é real.

Use pgTAP para a largura (muitos casos, mesma forma). Use integração para
provar que a cadeia de autenticação não mente para o pgTAP.

## Quando teste é entrega obrigatória de uma fase

O roadmap não pede teste em toda fase — pede onde o **erro é silencioso**:
isolamento vaza sem avisar (Fase 5), centavo some sem avisar (Fase 10),
conexão cai no meio do formulário sem avisar (Fase 9). Um formulário
quebrado grita sozinho na tela; não precisa de linha própria no roadmap
para isso.

Ao decidir se uma fase nova precisa de bateria própria, a pergunta é essa:
**se isso quebrar, alguém percebe olhando a tela, ou o dado já saiu
errado antes de aparecer sintoma nenhum?**

## Toda função em `src/utils/` tem teste

`convencoes-codigo.md` torna teste obrigatório em "função pura de cálculo,
schema e RPC financeira" — critério que exige julgar caso a caso. Para
`src/utils/` a régua é mais simples e não pede julgamento: é o helper que
foi promovido por servir 2+ lugares (`doc/estrutura-pastas.md`), então o
custo de uma regressão ali já é multiplicado pelo número de telas que o
chamam. **Toda função exportada de `src/utils/` tem `.test.ts` ao lado.**

Não vale para `utils.ts` de uma tela só (esse é local, ainda não provou
que serve a mais de um lugar — a obrigatoriedade começa na promoção).

## Um teste que nunca falhou não provou nada

Antes de um teste de proteção (RLS, validação, regra financeira) contar
como "pronto", ele precisa ser visto falhando pelo menos uma vez —
comentar a policy/regra que ele protege, rodar, ver vermelho, restaurar.
Um teste que só foi visto passando pode estar testando a ausência de erro
por acidente, não a presença da proteção.

### A sabotagem precisa ser cirúrgica (Fase 10, correções)

Vermelho não é prova. A primeira tentativa de derrubar `P16` tirou o
`where` de um `update ... returning ... into`, o que estoura "query
returned more than one row" e reprova o **arquivo inteiro** antes da
primeira asserção. Isso não diz nada sobre o caso: ele nem rodou.

A sabotagem tem que isolar o comportamento que o teste afirma, deixando
todo o resto funcionando. A versão útil incrementava todas as
organizações mas lia o número da própria — o contador vazava entre
fazendas, e nada mais quebrava.

### Teste que passa por vacuidade (Fase 10, correções)

Foi essa sabotagem refinada que expôs o defeito de verdade: `P16` **nunca
poderia falhar**. Ele lia `organizations` de B com as claims do dono de A,
que não enxerga aquela linha — a temp table nascia vazia e a comparação
virava `is(NULL, NULL)`.

Um teste vazio é pior que teste nenhum: ele ocupa a linha do relatório que
deveria acusar o defeito, e some no meio de 33 verdes. **Todo caso que
compara contra algo lido do banco precisa de uma pré-condição afirmando
que houve o que comparar** — um `cmp_ok(count(*), '>', 0, ...)` antes. O
mesmo vale para contagens de divergência (`P17`): "zero divergências"
entre zero linhas é verde por acidente, e é por isso que existe o `P17b`.

## Dinheiro em asserção: o espaço que não é espaço (Fase 11)

`Intl.NumberFormat('pt-BR', { style: 'currency' })` separa `R$` do número
com **espaço não-quebrável** (U+00A0), não com espaço comum. Isso quebra
asserções de duas formas distintas, e as duas mostram os dois lados
idênticos na mensagem de erro — que é o que torna o diagnóstico caro.

```
'R$ 340,00'  →  82 36 [160] 51 52 48 44 48 48
                      ↑ NBSP, não 32
```

**1. Literal digitado à mão não casa com a saída da função.**

```ts
expect(situacaoDoPedido(1000, 400)).toBe('Falta R$ 600,00') // ✗ falha
expect(situacaoDoPedido(1000, 400)).toBe(`Falta ${formatCurrency(600)}`) // ✓
```

`src/utils/formatCurrency.test.ts` (Fase 7) só passa porque tem o caractere
invisível gravado no arquivo — funciona, mas qualquer edição que reescreva
aquela linha o quebra. **Componha com a função**: o que a asserção afirma é
a montagem da frase, e a formatação já tem teste próprio.

**2. `getByText` normaliza o DOM, mas não o esperado.**

```ts
screen.getByText(formatCurrency(3800)) // ✗ falha mesmo com o elemento certo
```

O Testing Library troca NBSP por espaço comum no texto **lido do DOM** e
compara com a string esperada **crua**. Isolado num `<strong>` sozinho com
exatamente aquele conteúdo, ainda falha. Passe o valor já normalizado:

```ts
const naTela = (v: number): string => formatCurrency(v).replace(/ /g, ' ')
expect(screen.getByText(naTela(3800))).toBeInTheDocument() // ✓
```

## `throws_ok` do pgTAP — a armadilha dos 3 argumentos

`throws_ok(sql, '42501', descricao)` **não** funciona como parece: se o
2º argumento tem 5 caracteres, o pgTAP o trata como código de erro e usa
o 3º como **mensagem esperada** (não como rótulo do teste) — o teste só
passa se a mensagem bater exatamente, e o rótulo vira `NULL`. A forma
correta, sempre, é a de 4 argumentos:

```sql
select throws_ok(
  $$<comando que deve falhar>$$,
  '42501',  -- código
  NULL,     -- mensagem (NULL = não importa qual)
  'descrição do caso'
);
```

## `UPDATE`/`DELETE` sem policy de `select` correspondente falha em silêncio

Uma linha só é alcançável por `UPDATE`/`DELETE` se passar **também** por
uma policy de `SELECT` aplicável ao papel que chama — além da própria
policy de `UPDATE`/`DELETE`. Sem policy de `select` cobrindo a linha, o
comando não lança erro: afeta zero linhas, silenciosamente. Confirmado
empiricamente (Fase 5); ao escrever policy de `update`/`delete` para um
papel, sempre confira que existe `select` cobrindo o mesmo escopo — senão
o comando nunca faz nada, e nenhum teste ingênuo percebe (`throws_ok`
espera erro; aqui não há erro, há um `UPDATE 0` silencioso).

## `lives_ok` abre subtransação — e isso muda o que `xmin` responde

A policy de `pedido_itens` pergunta se o pedido nasceu na transação
corrente (`p.xmin = pg_current_xact_id()::xid`, ver
`rls-e-permissoes.md`). `lives_ok` e `throws_ok` executam o SQL dentro de
um bloco com handler de exceção, ou seja, **numa subtransação**: a linha
criada ali recebe o xid dela, e `pg_current_xact_id()` devolve o de topo.

Consequência prática: para testar o caminho feliz do lançamento (pedido
novo + itens), insira direto no corpo do teste, sem embrulhar em
`lives_ok` — do contrário o insert do item é recusado e o teste acusa uma
regressão que não existe. Para o caso que **deve** falhar (item em pedido
antigo), `throws_ok` funciona normalmente. Exemplo dos dois em
`06_funcionario_append_only.test.sql`, F6 e F7.

## `INSERT ... RETURNING` sem policy de `select` recusa o INSERT inteiro

Ao contrário do que se poderia supor, isso **não** é "grava e esconde o
retorno" — Postgres exige que a linha nova também passe por uma policy de
`select` quando há `RETURNING`; sem ela, o `INSERT` inteiro é recusado
(`new row violates row-level security policy`). É o mecanismo por trás da
regra "capacidade concede só a escrita" (`rls-e-permissoes.md`): a
ausência da policy de select não é uma convenção frágil, é a barreira
real.

## `PGRST303` intermitente em `pnpm test:rls` — relógio da VM, não bug (Fase 9)

Sintoma: a primeira chamada logo após `signIn()`, e só ela, falha de vez
em quando com `PGRST303` / "JWT issued at future" — a mesma suíte, rodada
de novo na sequência, passa. `date +%s` no host e nos containers bate
(mesmo segundo inteiro), o que engana: o desvio é de **sub-segundo**. O
`clock_timestamp()` do Postgres local ficou medido ~40–47ms à frente do
relógio do host (Docker Desktop no macOS). GoTrue crava `iat` no segundo
de emissão do token; se a chamada seguinte chega ao PostgREST antes do
relógio da VM alcançar aquele segundo, o token "ainda não nasceu" do
ponto de vista de quem valida — janela de dezenas de milissegundos,
por isso só aparece às vezes, e só na primeira chamada depois do login.

Não é bug de aplicação: produção nunca bate nessa janela, porque a
latência de rede real é maior que ela. A correção fica só no arnês
(`tests/integration/clients.ts`, função `signIn`): depois de logar, uma
leitura inofensiva (`organizations`, que todo `authenticated` já pode
ler) é repetida em retry curto até parar de devolver `PGRST303`, antes de
devolver o cliente para o teste. Nunca `sleep` de tamanho fixo — o retry
para assim que o relógio alcança, e não superestima a espera à toa.

## `row IS NOT NULL` não é "a função devolveu algo" (Fase 10)

Num tipo composto, `IS NOT NULL` só é verdade quando **todos** os campos
são não-nulos. `select remover_pagamento(...) is not null` devolve `f`
para uma remoção bem-sucedida, porque `forma_pagamento_id` pode ser nulo
na linha devolvida — e o teste reprova uma função que funcionou.

Para afirmar "devolveu uma linha", conte: `select count(*) from
minha_funcao(...)`.

## Fixture de teste e seed disputam o mesmo espaço de UUID (Fase 10)

`05_catalogo_fase8.test.sql` insere um pedido com id `cccccccc-…0001`
dentro da própria transação. A Fase 10 acrescentou ao **seed** pedidos com
o mesmo prefixo, e o resultado foi `duplicate key value violates unique
constraint "pedidos_pkey"` — num arquivo de teste que não tem nada a ver
com pagamentos, o que torna o sintoma difícil de ligar à causa.

Prefixo novo por bloco de fixture, sempre.

### O mesmo defeito, de novo na Fase 11 — e por que

O inventário abaixo dizia "`1111`–`8888` e `aaaa`/`bbbb` no seed, `cccc` na
Fase 8, `dddd` na Fase 10, `eeee` na integração". A Fase 11 escolheu `ffff`
confiando nele, e bateu de frente com a fixture da Fase 10.1
(`08_pagamentos_fase10.test.sql`, "Fixture do crédito"), que já usava `ffff`
e **nunca tinha sido anotada aqui**.

A lição não é "olhe a lista": é que a lista é derivada e envelhece sozinha.
Antes de escolher um prefixo, levante-o do código, não do documento:

```bash
grep -rhoE "'[0-9a-f]{8}-[0-9a-f]{4}-" supabase/seed.sql supabase/tests/ tests/ \
  | cut -c2-9 | sort -u
```

### Os 16 dígitos simples acabaram

| Prefixo         | Onde                                        |
| --------------- | ------------------------------------------- |
| `0000`          | seed · fixture local da Fase 8              |
| `1111`–`8888`   | seed (organizações, perfis, cadastro base)  |
| `6666`, `9999`  | seed · fixtures de isolamento e append-only |
| `aaaa` / `bbbb` | seed                                        |
| `cccc`          | fixture local do teste da Fase 8            |
| `dddd`          | seed da Fase 10 (a fixture do centavo)      |
| `eeee`          | fixture exclusiva da suíte de integração    |
| `ffff`          | fixture local da Fase 10.1 (crédito)        |
| **`f1f1f1f1`**  | **seed da Fase 11 (extrato)**               |
| **`f2f2f2f2`**  | **seed da Fase 12 (contas a receber)**      |

Com os 16 esgotados, o bloco novo passa a usar um par repetido que nomeia a
fase — `f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1NNNN` para a Fase 11. Continua
legível de relance, continua único, e a fase de origem fica escrita no
próprio id.

## A suíte de integração grava sem rollback — fixture dela é só dela (Fase 10, correções)

`pnpm test:db` roda cada arquivo dentro de uma transação com `rollback`:
o banco volta ao que era. `pnpm test:rls` **não** — ele loga de verdade,
chama a RPC de verdade e deixa tudo gravado.

Até 11/08/2026 `tests/integration/pagamentos.test.ts` usava `...880006`,
o cliente da fixture do centavo, e quitava os três pedidos de
33,33 / 33,33 / 33,34 a cada execução. O sintoma: `pnpm test:db` passava
sozinho e falhava depois de `pnpm test:rls`, com P1, P2 e P5 acusando
valores que **pareciam regressão da alocação**. A ordem das suítes mudava
o resultado, e o vermelho apontava para o lugar errado.

Duas regras saem daí:

- **Fixture da integração é exclusiva dela** (prefixo `eeee`), e sem
  pedidos: o que ela prova é que a claim emitida pelo Auth Hook bate com
  a que o pgTAP finge — não a distribuição, que é trabalho do pgTAP.
- **Teste de integração que precisa de estado monta o próprio.** O caso de
  concorrência cria o pedido que vai disputar, via `salvar_pedido`, em vez
  de ler um do seed: um pedido de fixture seria quitado na primeira
  execução e as seguintes passariam verdes sobre nada.

Vale rodar as duas ordens antes de dar uma fase por pronta.

### Um arquivo por vez, e sempre em banco recém-resetado (Fase 16)

Duas consequências da mesma propriedade — o arnês grava sem rollback num
banco compartilhado — que só apareceram quando a Fase 16 trouxe a
primeira suíte que **altera** uma fixture que outra apenas **lê**.

**1. `fileParallelism: false` em `vitest.config.integration.mts`.**
`equipe.test.ts` liga e desliga as capacidades de `funcionario@lida.com`
para provar que a claim segue a coluna; `pagamentos.test.ts` conta com
esse mesmo funcionário sem capacidade nenhuma. Rodando em paralelo (o
padrão do Vitest), a segunda lê no meio da primeira — e o `afterAll` que
restaura o estado chega tarde. O sintoma é o pior possível: falha
intermitente que muda de arquivo conforme a ordem sorteada.

Isolar por fixture própria resolveria só o caso de hoje. Serializar
resolve a classe inteira, e a bateria toda leva pouco mais de um segundo.

**2. Fixture compartilhada entre arquivos vira falha determinística.**
Serializar não criou o acoplamento — revelou um que já existia.
`extrato.test.ts` afirmava que `...eeee0001` não tem lançamento nenhum, e
`pagamentos.test.ts` grava naquele mesmo cliente no teste de
concorrência. Os dois arquivos se descreviam como donos **exclusivos** da
fixture `eeee`, e nenhum dos dois era.

Enquanto o Vitest paralelizava, a ordem variava e o verde era sorte. Com
a bateria em fila, o caso passou a rodar sempre depois da escrita — e a
falha aparecia no arquivo que não tinha culpa.

A correção foi um terceiro cliente (`...eeee0003`) que **ninguém
escreve**, usado só pela afirmação "a chamada atravessou o guard e a
lista veio vazia". Com ele, a bateria voltou a ser idempotente: roda duas
vezes seguidas sem `db reset` e dá o mesmo resultado.

A régua que sai daí, mais estreita que a de 2026-08-11: **fixture
exclusiva de um ARQUIVO, não da suíte.** "Exclusivo da integração" não
basta quando dois arquivos leem a mesma linha e um deles escreve.

## Preparo de fixture pode trocar de papel; o caso sob teste, não

`authenticated` não tem `delete` em `pagamento_pedidos` — e não deve ter,
porque a tabela é escrita só pela função `definer`. Zerar o estado no meio
de um arquivo de teste exige `set local role postgres` no preparo, com
`set local role authenticated` logo depois.

A linha divisória: **fixture** não passa pelas regras do produto; **caso**
passa sempre. Um preparo que tropeça numa permissão reprova o arquivo
inteiro provando apenas que o grant está certo — o que já é assunto de
outra bateria.
