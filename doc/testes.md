# Testes

Qual arnês usar para qual tipo de afirmação, e quando um teste é obrigatório. Como escrever um teste
de componente está em `convencoes-codigo.md`, seção Testes.

## Os arnêses

| Arnês                      | Onde                                      | Comando         | Precisa de quê                          |
| -------------------------- | ----------------------------------------- | --------------- | --------------------------------------- |
| Vitest (componente/lógica) | `src/**/*.test.ts(x)` e `tests/*.test.ts` | `pnpm test`     | nada: roda em `jsdom`, isolado          |
| pgTAP (RLS), alvo          | `supabase/tests/database/*.test.sql`      | `pnpm test:db`  | Supabase local de pé (`supabase start`) |
| Vitest de integração, alvo | `tests/integration/**/*.test.ts`          | `pnpm test:rls` | Supabase local de pé, login real        |

`tests/*.test.ts`, direto na pasta, é para teste que não tem um arquivo para co-localizar: ele
verifica uma regra sobre o repositório inteiro, não um módulo (por exemplo, "nenhum arquivo alcançável
pelo navegador importa a chave `service_role`"). Ainda roda no arnês padrão, só não mora dentro de
`src/`.

Teste que lê ou grava o mock monta o estado pela função de exemplo do próprio `<dom>.mock.ts`, no
`beforeEach`. O mock é em memória e compartilhado pelo arquivo de teste inteiro.

### Por que dois arnêses de banco, não um

> Alvo (Supabase): ainda não implementado.

O pgTAP simula a claim do usuário com `set local request.jwt.claims`. Roda dentro do banco e cobre uma
matriz densa de tabelas e casos rápido, mas **finge** o JWT. Se o que o Auth Hook realmente emite
divergir do que o teste finge, o teste passa verde e a produção vaza.

A integração loga de verdade (`signInWithPassword`) e prova a cadeia inteira. É mais lenta e cobre
menos casos, mas o que ela prova é real.

Use pgTAP para a largura (muitos casos, mesma forma). Use integração para provar que a cadeia de
autenticação não mente para o pgTAP.

## Quando teste é obrigatório

A pergunta é: **se isso quebrar, alguém percebe olhando a tela, ou o dado já saiu errado antes de
aparecer sintoma nenhum?** Onde o erro é silencioso, o teste é obrigatório:

- **Cálculo de horas** (RF14, RNF20): uma hora a mais ou a menos no total não grita na tela.
- **Salvar completo ou nada** (RNF24): comprovante perdido no meio do envio só aparece quando o
  aluno precisar dele.
- **Isolamento entre alunos** (RNF04, alvo): um aluno lendo o comprovante de outro não dá erro.

Um formulário quebrado grita sozinho na tela e não precisa de teste obrigatório por isso.

- Função pura de cálculo e schema têm teste, em `.test.ts` ao lado.
- Teste verifica comportamento visível, não implementação interna.

## Toda função em `src/utils/` tem teste

`convencoes-codigo.md` torna o teste obrigatório em "função pura de cálculo e schema", critério que
exige julgar caso a caso. Para `src/utils/` a régua é mais simples e não pede julgamento: é o helper
que foi promovido por servir 2+ lugares, então o custo de uma regressão ali já é multiplicado pelo
número de telas que o chamam. **Toda função exportada de `src/utils/` tem `.test.ts` ao lado.**

Não vale para o `utils.ts` de uma tela só: ele é local e ainda não provou que serve a mais de um
lugar. A obrigatoriedade começa na promoção.

## Um teste que nunca falhou não provou nada

Antes de um teste de proteção (validação, regra de horas, policy) contar como "pronto", ele precisa
ser visto falhando pelo menos uma vez: comente a regra que ele protege, rode, veja vermelho,
restaure. Um teste que só foi visto passando pode estar testando a ausência de erro por acidente, e
não a presença da proteção.

### A sabotagem precisa ser cirúrgica

Vermelho não é prova. Tirar o `where` de um `update ... returning ... into` estoura "query returned
more than one row" e reprova o **arquivo inteiro** antes da primeira asserção. Isso não diz nada
sobre o caso: ele nem rodou.

A sabotagem tem que isolar o comportamento que o teste afirma, deixando todo o resto funcionando. Num
cálculo de total por categoria, a sabotagem útil é somar todas as categorias mas ler o número de uma
só: o total vaza entre categorias e nada mais quebra.

### Teste que passa por vacuidade

Um teste vazio é pior que teste nenhum: ele ocupa a linha do relatório que deveria acusar o defeito
e some no meio de dezenas de verdes. **Todo caso que compara contra algo lido (do mock, do banco)
precisa de uma pré-condição afirmando que houve o que comparar.** Comparar duas listas vazias, ou
`is(NULL, NULL)`, passa sobre nada. O mesmo vale para contagem de divergência: "zero divergências"
entre zero linhas é verde por acidente.

```ts
const registros = await getAtividades(filtros)

expect(registros.length).toBeGreaterThan(0) // pré-condição: há o que comparar
expect(somaDasLinhas(registros)).toBe(totais.horasComputadas)
```

## Formatação em asserção

Número formatado por `Intl` com unidade ou moeda (`style: 'currency'`, `style: 'unit'`) separa o
valor do símbolo com **espaço não quebrável** (U+00A0), não com espaço comum. Isso quebra asserções
de duas formas, e as duas mostram os dois lados idênticos na mensagem de erro, o que torna o
diagnóstico caro.

1. **Literal digitado à mão não casa com a saída da função.** Componha a asserção com a própria
   função de formatação: o que a asserção afirma é a montagem da frase, e a formatação já tem teste
   próprio.

   ```ts
   expect(mensagemDeFalta(10, 4)).toBe('Faltam 6 horas') // ✗ se houver NBSP no meio
   expect(mensagemDeFalta(10, 4)).toBe(`Faltam ${formatHoras(6)}`) // ✓
   ```

2. **`getByText` normaliza o DOM, mas não o esperado.** O Testing Library troca NBSP por espaço
   comum no texto **lido do DOM** e compara com a string esperada **crua**. Passe o valor já
   normalizado.

   ```ts
   const naTela = (texto: string): string => texto.replace(/ /g, ' ')
   expect(screen.getByText(naTela(formatHoras(61)))).toBeInTheDocument()
   ```

Horas formatadas hoje (`formatHoras`) saem como `10,0h`, sem espaço, então a armadilha não aparece
nelas. Ela aparece no dia em que alguém trocar por `style: 'unit'`.

## Armadilhas do arnê de banco

> Alvo (Supabase): ainda não implementado. Cada item abaixo foi medido no projeto de origem desta
> documentação e vale para qualquer projeto sobre Supabase.

### `throws_ok` do pgTAP: a armadilha dos 3 argumentos

`throws_ok(sql, '42501', descricao)` **não** funciona como parece. Se o 2º argumento tem 5
caracteres, o pgTAP o trata como código de erro e usa o 3º como **mensagem esperada**, não como
rótulo do teste: o teste só passa se a mensagem bater exatamente, e o rótulo vira `NULL`. A forma
correta, sempre, é a de 4 argumentos:

```sql
select throws_ok(
  $$<comando que deve falhar>$$,
  '42501',  -- código
  NULL,     -- mensagem (NULL = não importa qual)
  'descrição do caso'
);
```

### `UPDATE`/`DELETE` sem policy de `select` correspondente falha em silêncio

Uma linha só é alcançável por `UPDATE`/`DELETE` se passar **também** por uma policy de `SELECT`
aplicável ao papel que chama, além da própria policy de `UPDATE`/`DELETE`. Sem policy de `select`
cobrindo a linha, o comando não lança erro: afeta zero linhas, silenciosamente. Ao escrever policy de
`update`/`delete`, confira que existe `select` cobrindo o mesmo escopo. Nenhum teste ingênuo percebe,
porque `throws_ok` espera erro e aqui há um `UPDATE 0` silencioso.

### `INSERT ... RETURNING` sem policy de `select` recusa o INSERT inteiro

Isso **não** é "grava e esconde o retorno". O Postgres exige que a linha nova também passe por uma
policy de `select` quando há `RETURNING`; sem ela, o `INSERT` inteiro é recusado
(`new row violates row-level security policy`).

### `row IS NOT NULL` não é "a função devolveu algo"

Num tipo composto, `IS NOT NULL` só é verdade quando **todos** os campos são não nulos. Uma função
que funcionou pode devolver um campo nulo e reprovar o teste. Para afirmar "devolveu uma linha",
conte: `select count(*) from minha_funcao(...)`.

### Fixture de teste e seed disputam o mesmo espaço de UUID

Um arquivo de teste que insere um registro com id fixo, dentro da própria transação, quebra com
`duplicate key value violates unique constraint` no dia em que o **seed** ganhar um registro com o
mesmo prefixo, e num arquivo que não tem nada a ver com a mudança. **Prefixo novo por bloco de
fixture, sempre.** A lista de prefixos usados é derivada e envelhece sozinha: levante-a do código,
não de um documento.

```bash
grep -rhoE "'[0-9a-f]{8}-[0-9a-f]{4}-" supabase/seed.sql supabase/tests/ tests/ \
  | cut -c2-9 | sort -u
```

### A suíte de integração grava sem rollback

`pnpm test:db` roda cada arquivo dentro de uma transação com `rollback`: o banco volta ao que era.
`pnpm test:rls` **não**: ele loga de verdade, chama a RPC de verdade e deixa tudo gravado. Daí saem
as regras:

- **Fixture da integração é exclusiva de um ARQUIVO**, não da suíte. Dois arquivos que leem a mesma
  linha, um deles escrevendo, produzem falha intermitente que muda de arquivo conforme a ordem.
- **Teste de integração que precisa de estado monta o próprio**, pela RPC, em vez de ler um registro
  do seed. Um registro de fixture seria alterado na primeira execução e as seguintes passariam
  verdes sobre nada.
- **Um arquivo por vez** (`fileParallelism: false` na config de integração), sempre em banco
  recém-resetado. A bateria toda leva pouco mais de um segundo, e serializar resolve a classe inteira
  de problemas em vez de um caso.
- Vale rodar as duas ordens das suítes antes de dar uma tarefa por pronta.

### Preparo de fixture pode trocar de papel; o caso sob teste, não

Zerar o estado no meio de um arquivo pode exigir `set local role postgres` no preparo, com
`set local role authenticated` logo depois. A linha divisória: **fixture** não passa pelas regras do
produto; **caso** passa sempre. Um preparo que tropeça numa permissão reprova o arquivo inteiro
provando apenas que o grant está certo, o que já é assunto de outra bateria.

### `PGRST303` intermitente: relógio da VM, não bug

Sintoma: a primeira chamada logo após `signIn()`, e só ela, falha de vez em quando com `PGRST303`
("JWT issued at future"), e a mesma suíte rodada de novo passa. O desvio é de **sub-segundo**: em
Docker Desktop no macOS, o relógio do Postgres local pode ficar dezenas de milissegundos à frente do
do host, e o token "ainda não nasceu" para quem o valida. Produção nunca bate nessa janela, porque a
latência real da rede é maior.

A correção fica só no arnês: depois de logar, uma leitura inofensiva é repetida em retry curto até
parar de devolver `PGRST303`. Nunca `sleep` de tamanho fixo.
