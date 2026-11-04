# RLS e permissões

Autorização é decidida no banco. O front esconde botão por conveniência
de UX, nunca como barreira.

## Função de contexto

Toda policy precisa saber a organização, o papel e as capacidades
individuais de quem chamou. Isso vem de três funções `stable`,
`security invoker`, que leem `auth.jwt()` — nunca consultam `profiles`:

```sql
create function org_atual() returns uuid
language sql stable security invoker
as $$ select ... auth.jwt() -> 'app_metadata' ->> 'organization_id' ... $$;
```

`papel_atual()` e `tem_capacidade(text)` seguem o mesmo desenho. As
claims (`organization_id`, `papel`, `organizacao_ativa`,
`pode_lancar_pagamento`, `pode_lancar_despesa`) são escritas no token pelo
Auth Hook (Fase 4) a cada login/renovação — ler delas dentro do Postgres é
acessar memória da sessão, já verificada na assinatura do JWT, não uma
consulta.

**Por que isso importa mais do que parece:** uma policy sobre `profiles`
que consultasse a própria `profiles` entraria em recursão infinita
(`infinite recursion detected in policy for relation "profiles"`) — é o
erro mais citado sobre RLS no Postgres. A saída clássica é marcar a
função como `security definer` (roda com privilégio elevado, ignora RLS,
quebra o ciclo). Aqui isso não é necessário: sem consulta a `profiles`,
não existe ciclo para quebrar. `security invoker` nas três, sem exceção.

Toda comparação usa a função dentro de um `(select ...)`, nunca solta:

```sql
using (organization_id = (select org_atual()))   -- ✅ calculado 1x, InitPlan
using (organization_id = org_atual())            -- ❌ reavaliado por linha
```

Sem sessão, sem claim, ou organização pausada (`organizacao_ativa =
false`): as três funções devolvem o valor "vazio" (`null` ou `false`).
Em SQL, `coluna = null` nunca é verdadeiro — o estado degradado do
sistema é negar, por construção. Isso também fecha, sem policy extra,
o caso de uma organização pausada continuar sendo acessada direto pela
API do PostgREST (o bloqueio do `src/proxy.ts` é fronteira de navegação,
não de segurança — a fronteira real é esta).

## Padrão por tipo de tabela

| Tipo de tabela             | Policy                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| Negócio                    | isolamento por organização em todos os comandos                       |
| Com visibilidade por autor | leitura adicionalmente filtrada por quem criou, quando o papel exigir |
| Configuração               | leitura para a organização; escrita só para o papel administrador     |

### Visibilidade por autor sem coluna própria

`pedido_itens` e `pagamento_pedidos` não guardam `created_by` — item e
vínculo não têm autoria própria, pertencem a um pedido/pagamento. A
policy usa `exists (select 1 from pedidos where id = pedido_id)`: como
essa subconsulta já é filtrada pelo RLS de `pedidos` para quem chamou, a
visibilidade herda automaticamente (dono vê tudo, funcionário só o
próprio) sem repetir a condição de autoria numa segunda tabela.

A herança resolve **leitura**. Escrita na tabela filha exige condição
própria: herdar "eu enxergo este pedido" como se fosse "eu posso alterar
este pedido" foi exatamente o furo que a escrita append-only fechou —
ver a seção sobre isso adiante.

### Referência cruzada entre organizações

Uma chave estrangeira garante que a linha referenciada existe, não que é
da mesma organização — um `pedido_id` de A pode apontar, por FK, para um
`cliente_id` de B, se alguém souber o UUID. O `with check` de escrita
sempre confere isso explicitamente:

```sql
with check (
  organization_id = (select org_atual())
  and exists (select 1 from clientes c where c.id = cliente_id and c.organization_id = (select org_atual()))
)
```

Vale para toda FK que aponte para outra tabela com dono de organização:
`cliente_id`, `produto_id`, `unidade_id`, `variacao_id`,
`local_venda_id`, `categoria_id`, `forma_pagamento_id`.

## Papéis

|                                    | Dono | Funcionário               |
| ---------------------------------- | ---- | ------------------------- |
| Lançar venda                       | sim  | sim                       |
| Ver toda a operação da organização | sim  | só o que ele mesmo lançou |
| **Editar registro já lançado**     | sim  | **nunca, nem o próprio**  |
| **Excluir registro já lançado**    | sim  | **nunca, nem o próprio**  |
| Dado financeiro consolidado        | sim  | nunca                     |
| Cadastro base e configuração       | sim  | não                       |
| Gestão de acessos                  | sim  | não                       |
| **Revogar o acesso de um dono**    | não  | não                       |

A última linha não é redundante com "Gestão de acessos". Dono revoga
funcionário, e só: `profiles_update_dono` recusa gravar
`acesso_removido_em` em qualquer perfil de papel dono, inclusive o
próprio. Uma organização sem dono nenhum é irrecuperável pela própria
tela — não sobra quem crie acesso nem quem desfaça o erro — e vira
chamado manual no Studio, que é o que a Fase 16 existe para eliminar.

## Escrita do funcionário é append-only

Ele grava, enxerga o pedido que ele mesmo gravou, e para por aí: nenhuma
alteração e nenhuma remoção, nem do próprio lançamento. Vale para pedido,
pagamento e despesa. Quem corrige é o dono — é ele quem responde pelo
número no fim do mês, e uma venda de campo reescrita depois deixa de ter
versão original.

**Em pagamento e despesa a recusa vem com mensagem, não em silêncio.**
`registrar_pagamento` e `registrar_despesa` são `security definer` e
atravessam as policies, então a autorização vira guard explícito dentro
delas (`LID32` e `LID61`); corrigir e remover lançam `LID37` e `LID62`.
A policy continua sendo a trava — o guard existe porque `definer` a
dispensou, e porque zero linhas em silêncio deixaria a tela dizendo
"Saída atualizada" sobre nada.

Isso custa três coisas no banco, e as três estão em
`20260808090000_funcionario_sem_edicao.sql`:

1. **Nenhuma policy de `update` para o papel.** Não existe versão
   "própria" — só `pedidos_update_dono`. Consequência que muda como o
   teste é escrito: sem policy de update, a `USING` filtra a linha e o
   comando afeta zero linhas **sem erro**, em vez de lançar `42501`.
2. **`pedido_itens` exige papel de dono explicitamente no `update`.** A
   herança de visibilidade descrita acima resolve leitura, não escrita:
   sem a condição de papel, o funcionário editaria a venda pela tabela
   filha sem nunca tocar em `pedidos`.
3. **Item novo só entra em pedido que nasceu na mesma transação:**

```sql
and (
  (select papel_atual()) = 'dono'
  or p.xmin = pg_current_xact_id()::xid   -- este pedido nasceu agora?
)
```

`xmin` é a transação que criou a linha, gravada nela e imutável — nenhuma
transação concorrente muda essa resposta (foi por isso que a variante
"o pedido ainda não tem item" caiu: dois inserts simultâneos veem o mesmo
pedido vazio e passam os dois). Sem essa trava, acrescentar item a uma
venda antiga muda o total dela: edição por outra porta.

Duas obrigações que a trava impõe a quem escrever a RPC de pedido:

- **pedido e itens na mesma transação** — o que a regra de escrita
  multi-tabela já exigia. Dois requests separados falham com `42501`, na
  tela, não em silêncio;
- **o pedido não pode nascer dentro de bloco `exception when`** — o
  handler abre subtransação, a linha recebe o xid dela, e
  `pg_current_xact_id()` devolve o de topo: o item seria recusado.
  `raise exception` sem handler, como em `salvar_produto`, não tem esse
  efeito.

### Na tela: o guard vai na barra de ações inteira, nunca botão a botão

Esconder botão é UX, não segurança — quem barra é a policy. Mas a forma de
esconder tem uma regra, porque o mesmo defeito já apareceu **duas vezes**
no protótipo, pelo mesmo mecanismo: em `pedidos.jsx` (Tela 06) e em
`pagamentos.jsx` (Tela 07), quem escreveu guardou o botão **destrutivo**
atrás de `dono ?` e esqueceu o de **edição**.

Remover _parece_ mais perigoso, então ganha o guard sozinho. Mas os dois
escrevem — e o de edição é o pior dos dois, porque a recusa dele é
silenciosa (zero linhas afetadas, sem erro), enquanto uma remoção que não
acontece pelo menos deixa o registro na tela.

Por isso: **a barra de ações de tela de detalhe nasce com um guard só, no
bloco inteiro.**

```tsx
// certo — um guard, nada escapa
{
  canEdit ? (
    <S.Acoes>
      <Button>Editar</Button>
      <Button variant="destructive">Remover</Button>
    </S.Acoes>
  ) : null
}

// errado — dois guards, e o próximo botão nasce sem nenhum
;<S.Acoes>
  <Button>Editar</Button>
  {canEdit ? <Button variant="destructive">Remover</Button> : null}
</S.Acoes>
```

#### O prop nomeia a capacidade, não o papel — e nunca mistura com layout

`DetalhePedido` recebe **três** props em vez de um `isDono`, porque são
três decisões que só por coincidência andam juntas hoje:

| Prop                             | Decide                           | Por que não é derivável dos outros                                           |
| -------------------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| `shell: 'dono' \| 'funcionario'` | qual chrome desenhar             | é layout: o `AppShellFuncionario` já desenha topo e "Voltar"                 |
| `canEdit: boolean`               | se a barra Editar/Remover existe | vai divergir do papel na Fase 10, quando as capacidades individuais entrarem |
| `showPayment: boolean`           | chip de status e seção Pagamento | quem pode corrigir e quem pode ver o dinheiro são recortes diferentes        |

> **Mudou na Fase 10.** Até a Fase 9, `hasPayment` também desabilitava o
> botão Remover, e este documento descrevia isso como parte do desenho.
> Não vale mais: a realocação em cascata devolve o dinheiro do pedido
> removido à fila do cliente, o `LID27` saiu do banco e o `disabled` saiu
> da tela. O modal de confirmação passou a dizer para onde o valor vai.

Um booleano `isDono` fazendo os três trabalhos significa que mexer numa
regra mexe nas outras duas de carona — e foi exatamente assim que o chip
de status e o botão "Voltar", que não têm nada a ver um com o outro,
acabaram no mesmo `if`.

Nomear a capacidade em vez do papel também é o que faz o prop sobreviver
às **permissões individuais** (seção abaixo): lá a pergunta deixa de ser
"é dono?" e passa a ser "tem `pode_lancar_pagamento`?".

Os três chegam por **valor literal, vindo da página do grupo de rota** —
nunca lidos da sessão dentro do componente. A rota do funcionário passa
`canEdit={false}` fixo, e nem existe
`/campo/pedidos/[numero]/editar` para navegar.

#### O que garante isso não é a convenção, é o teste

Convenção em documento é hábito; teste é armadilha. Toda tela de detalhe
renderizada no contexto do funcionário chama:

```ts
import { expectNoRewriteActions } from '@/utils/tests/permissoes'

expectNoRewriteActions() // falha nomeando o que vazou: "Editar, Remover"
```

O helper procura por _reescrita_ (editar, corrigir, remover, excluir,
apagar) — deliberadamente **não** por "lançar" ou "salvar", que são
escrita permitida ao funcionário. A segunda consumidora será a tela de
Pagamentos, na Fase 10.

## Permissões individuais

Além do papel, o dono pode habilitar capacidades por pessoa —
`pode_lancar_pagamento` e `pode_lancar_despesa`, colunas booleanas em
`profiles`, emitidas como claim pelo Auth Hook (não lidas da tabela
dentro da policy — mesmo raciocínio da função de contexto). São
independentes entre si: habilitar uma não habilita a outra.

Uma capacidade concede **apenas a escrita** correspondente — nunca abre
leitura de histórico, de lista consolidada ou de configuração. Isto foi
avaliado explicitamente como uma capacidade separada de "ver" (uma
`pode_ver_financeiro`, independente de lançar) e descartado: o risco que
essa leitura abriria — funcionário com acesso ao caixa inteiro da
organização — é exatamente o que este desenho existe para fechar.

Isso se implementa com policies separadas por comando: existe policy de
inserção condicionada à capacidade, e não existe policy de leitura
equivalente para aquele papel. A ausência da policy de select não é uma
convenção de código a ser lembrada — é a barreira real: um `insert().select()`
enviado por engano falha (Postgres recusa o `INSERT` inteiro quando há
`RETURNING` sem policy de select cobrindo a linha nova), não "grava e
esconde o resultado". Detalhe do mecanismo e como testá-lo:
`doc/testes.md`.

## A exceção `security definer` (Fase 10)

A decisão D9 reservou uma exceção nomeada à regra "RPC é `invoker`". A
Fase 10 a usou, em duas funções: `registrar_pagamento` e
`realocar_pagamentos_do_cliente`.

**Por que elas não podem ser `invoker`.** Duas razões independentes:

1. A alocação varre pedidos que quem chama não pode ler. O funcionário com
   `pode_lancar_pagamento` só enxerga o que ele mesmo lançou
   (`pedidos_select_proprio`). Uma função `invoker` distribuiria o dinheiro
   só nessa lista curta, deixando de fora os pedidos lançados por outra
   pessoa — **sem erro nenhum**: o pagamento fecharia com "sobrou crédito" e
   a dívida real continuaria de pé.
2. `pagamento_pedidos` não tem policy de escrita, por decisão da Fase 5.

**O que a exceção custa, e como ele é pago.** Com o RLS desligado dentro
da função, a checagem de organização vira código à mão. Três obrigações,
todas cobertas por teste em `08_pagamentos_fase10.test.sql`:

| Obrigação                                  | O que acontece sem ela                                        | Caso |
| ------------------------------------------ | ------------------------------------------------------------- | ---- |
| `organization_id = v_org` em toda consulta | O pagamento de uma fazenda é alocado contra o pedido de outra | P10  |
| Checagem de papel/capacidade escrita à mão | A policy não roda; sem o `raise`, qualquer um grava           | P8   |
| Retorno recortado por papel                | O `definer` devolve o caixa do cliente a quem só pode lançar  | P7   |

A terceira é a menos óbvia e a mais perigosa: a ausência de policy de
`select` **não** protege o retorno de uma função `definer`. O recorte é
código, e código é o que se esquece — por isso os três casos foram vistos
falhando antes de contarem como prontos (registro no cabeçalho do arquivo
de teste).

**A assinatura importa.** `realocar_pagamentos_do_cliente` precisa de
`grant execute` a `authenticated`, porque `atualizar_pedido` e
`remover_pedido` são `invoker` e a chamam. Por isso ela lê `org_atual()`
em vez de receber a organização por parâmetro: com o parâmetro, qualquer
autenticado reescreveria o pareamento de outra fazenda. Função `definer`
exposta nunca deve aceitar de fora o dado que decide o alcance dela.

## Regras

- Toda tabela tem RLS habilitado. Tabela sem policy fica inacessível, não
  liberada.
- Funcionário escreve, nunca reescreve: policy de `update`/`delete` para
  esse papel não existe em nenhuma tabela de operação, e tabela filha de
  registro dele exige papel de dono na escrita, sem herdar da leitura.
- Policy por comando quando ler e gravar têm permissões diferentes;
  policy única só quando são idênticas.
- Verificação de capacidade acontece na policy, nunca em código de
  aplicação.
- RPC roda como `security invoker` e continua sujeita às policies, com
  uma única classe de exceção nomeada e nunca ad-hoc — ver
  `arquitetura.md`. A exceção existe e tem duas funções (Fase 10): ver
  abaixo.
- Tabela nova nasce com RLS e policy na mesma migration.
- Nenhuma chave de serviço (`service_role`) é usada em código que o
  usuário alcança — travado por lint e por teste (Fase 5,
  `tests/service-role-key.test.ts`).
- `UPDATE`/`DELETE` só alcança uma linha se ela também passar por uma
  policy de `select` aplicável ao papel — sem select cobrindo, o comando
  não lança erro, afeta zero linhas em silêncio. Ao escrever policy de
  escrita para um papel, sempre confira que existe leitura no mesmo
  escopo (detalhe: `doc/testes.md`).

## Escrita em `profiles` (Fase 16)

A Fase 5 deixou `profiles` com policy de `select` apenas, e registrou que
editar a tabela era escopo de uma fase futura. É esta — a numeração dizia
"Fase 15" antes de o Extrato virar fase própria e empurrar tudo em um.

Existe uma policy de escrita, `profiles_update_dono`, e ela é a única:
dono, própria organização, nos dois lados (`using` **e** `with check`).
Não há policy de `insert` — perfil nasce pelo gatilho `security definer`
do cadastro, nunca por comando de usuário — nem de `delete`, pela razão
da seção seguinte.

### Três colunas que a policy não protege, e o trigger sim

Policy compara a linha nova com o contexto de quem chama; não enxerga a
linha antiga. `id`, `organization_id` e `papel` precisam exatamente dessa
comparação, e por isso são congeladas por
`profiles_congela_identidade()`, um `before update` que recusa qualquer
alteração nelas. Trocar `papel` mudaria o alcance de 14 tabelas de uma
vez, e é uma operação que nenhuma tela do produto oferece hoje.

Quando existir tela para trocar papel, a exceção nasce nomeada nesse
trigger. O caminho oposto — não ter congelado nada e descobrir depois —
não deixa registro de que a coluna algum dia esteve fechada.

## Acesso removido (Fase 16)

Remover o acesso de alguém não pode ser apagar a linha de `profiles`: o
banco já recusa por causa da chave estrangeira que `created_by` mantém
com pedidos/pagamentos/despesas histórico (`on delete restrict`,
implícito por não ter sido declarado de outra forma) — tentar apagar um
perfil com histórico lançado falha com
`update or delete on table "profiles" violates foreign key constraint`.
Correto por acidente até a Fase 16; correto de propósito a partir dela.

**Revogar é gravar uma data:** `profiles.acesso_removido_em`, nula
enquanto o acesso vale. As três decisões de produto que faltavam:

| Pergunta                                  | Decisão                                      |
| ----------------------------------------- | -------------------------------------------- |
| Onde a revogação passa a valer            | No **Auth Hook**, não em policy por tabela   |
| O que acontece com quem está logado agora | Cai na hora, por `ban_duration` na Admin API |
| A pessoa some da lista de equipe          | Sim — a tela responde "quem tem acesso"      |

### Por que no Auth Hook e não em 14 policies

O Auth Hook é o único ponto por onde todo token passa. Quando ele deixa
de emitir `organizacao_ativa: true`, as três funções de contexto devolvem
`null`/`false`, e `coluna = null` nunca é verdadeiro em SQL: as 14
tabelas fecham de uma vez, sem uma policy sequer. É o mesmo mecanismo que
já fecha a organização pausada. Uma condição `acesso_removido_em is null`
por tabela seriam 14 lugares para esquecer um.

Acesso removido cai no **mesmo ramo de `perfil_ausente`** do hook, de
propósito: as duas situações significam "esta sessão não alcança dado
nenhum", e o `proxy.ts` já sabe tratar a primeira. A claim
`acesso_removido` entra além dela, para diagnóstico e teste — nunca para
decidir navegação. A tela de destino não distingue os dois casos na copy:
dizer "seu acesso foi removido" confirmaria uma demissão pela tela de
login.

### O buraco de tempo, e quem o fecha

O hook só roda quando um token é emitido — login ou renovação, hoje até
`jwt_expiry`. Sozinho, ele deixaria alguém removido de manhã lançando
pedido até o almoço. Quem fecha isso está **fora do banco**: o Route
Handler `DELETE /api/equipe/[id]` chama `auth.admin.updateUserById` com
`ban_duration`, invalidando os refresh tokens.

O fato mora em dois lugares, e a hierarquia entre eles é explícita: a
coluna é a fonte da verdade, o ban é só o acelerador. Se o ban falhar e a
coluna gravar, o pior caso é a demora de uma renovação — nunca um acesso
que continua valendo.

## `service_role` e a fronteira do Route Handler (Fase 16)

Esta é a primeira fase com Route Handler. Criar usuário e banir são
chamadas à Admin API do GoTrue, que exige a chave `service_role` — e essa
chave **ignora RLS por completo**.

São só dois endereços, e a lista curta é proposital:

| Rota                      | Faz                                |
| ------------------------- | ---------------------------------- |
| `POST /api/equipe`        | cria o usuário de autenticação     |
| `DELETE /api/equipe/[id]` | revoga o acesso e derruba a sessão |

**Não existe `PATCH`**, porque acesso criado não é editado: nome e e-mail
ficam como foram cadastrados, e as duas capacidades mudam pelo
interruptor da lista — um `update` em `profiles`, protegido por
`profiles_update_dono`, que não passa por handler nenhum. Isso mantém a
autorização na policy no caminho mais usado da tela, e fecha de graça o
risco de `profiles.email` divergir de `auth.users.email`.

A regra dentro do handler: **dois clientes, fronteira explícita.**

```ts
const db = await createClient() // cookies de quem chamou → RLS ativa
const admin = createAdminClient() // service_role → RLS ignorada
```

O `admin` faz só o que não tem versão por tabela — criar o usuário de
autenticação e banir. Tudo que toca `profiles` (ler a equipe, ligar
capacidade, marcar revogação) passa pelo cliente de quem chamou e
continua sujeito à policy.

Cada tabela tocada pelo `admin` é uma tabela onde a autorização deixou de
ser a policy e virou um `if` escrito à mão. O `if` é o que se esquece.

Além disso, **a chave não traz autorização junto**: todo handler começa
lendo a sessão e exigindo `papel === 'dono'`. Ter a chave prova que o
código roda no servidor, não que quem pediu podia pedir.

São três endereços no total — o terceiro é `POST /api/equipe/[id]/senha`,
descrito na seção de senha abaixo.

A fábrica do cliente admin vive em `src/@supabase/admin.ts`, atrás de
`import 'server-only'` — que quebra o **build** se um Client Component a
alcançar. `tests/service-role-key.test.ts` guarda contra a chave se
espalhar para um terceiro arquivo.

## Autocadastro não existe — e a config precisa dizer isso (Fase 16)

`doc/provisionamento-manual.md` abre com a frase "não existe
autocadastro". Até 2026-08-16 ela era **falsa**, e a falha era de
configuração, não de código.

`enable_signup` vinha em `true` (o padrão do Supabase). A chave `anon` é
pública — vai no bundle do navegador —, então qualquer pessoa criava uma
organização inteira:

```bash
curl -X POST .../auth/v1/signup -H "apikey: <anon>" \
  -d '{"email":"...","password":"...",
       "data":{"nome":"X","nome_fazenda":"Y"}}'
```

O gatilho `criar_perfil_no_cadastro` barrava só quem esquecesse o campo
`nome`. Com a metadata completa, o cadastro passava, a organização
nascia com catálogo provisionado e a pessoa entrava como **dono**.

Não era vazamento — o RLS isola cada organização, e o invasor via apenas
a própria. Era abuso de recurso e contorno do modelo de negócio, que em
produção custa dinheiro por linha.

**Duas flags de nome parecido, e só uma é a certa:**

| Flag                         | Efeito                                         |
| ---------------------------- | ---------------------------------------------- |
| `[auth] enable_signup`       | fecha o `/auth/v1/signup` público — **é esta** |
| `[auth.email] enable_signup` | desliga o **provider de e-mail inteiro**       |

A segunda em `false` derruba o login: `/auth/v1/token?grant_type=password`
passa a devolver `email_provider_disabled` e ninguém entra no sistema.
Medido durante a correção.

Fechar o signup **não** afeta o provisionamento: Studio e Route Handler
criam usuário pela Admin API (`service_role`), que ignora a flag.

`tests/integration/equipe.test.ts` trava as duas pontas (A1 e A2) —
porque a correção é uma linha de config, invisível em code review, e o
padrão volta a ser `true` num projeto criado do zero. **Confira isso ao
criar o projeto de produção.**

## Senha: ninguém opera com a senha que outro escolheu (Fase 16)

Toda conta do Lida nasce com a senha digitada por **outra pessoa**: quem
opera o sistema cria a do dono no Studio, e o dono cria a do funcionário
pela tela de equipe. Num livro-caixa de fazenda isso é um problema real —
a pergunta "quem lançou isto?" não tem resposta inequívoca enquanto duas
pessoas conhecem a mesma senha.

`profiles.senha_definida_em` guarda **quando a pessoa definiu a própria
senha**. Nula significa "a senha em uso não é dela", e o Auth Hook emite
isso como `precisa_trocar_senha`. O `proxy.ts` lê a claim e segura a
pessoa em `/trocar-senha` — antes da regra de rota pública e da separação
por papel, porque é a checagem mais restritiva que sobra.

### O detalhe que produz loop infinito

A claim é escrita **na emissão do token**. Trocar a senha grava a coluna,
mas o token em uso continua dizendo `true` — e o proxy devolve a pessoa
para a mesma tela, indefinidamente.

Quem fecha isso é `changePassword`, chamando `refreshSession()` como
terceiro passo. Sem ele, todo o pgTAP continua verde: ele nunca chama o
Auth Hook. Quem pega é `tests/integration/senha.test.ts`, caso P3 — e ele
chama `changePassword` de verdade, em vez de repetir os passos, porque um
`refreshSession()` escrito no teste esconderia a falta do de produção.

### `marcar_senha_como_propria()` — `definer` sem parâmetro

A função é `security definer` porque `profiles_update_dono` é dono-only:
sem isso, o funcionário trocaria a senha no GoTrue e a coluna ficaria
nula, prendendo-o na tela para sempre.

Ela **não aceita parâmetro nenhum** — escreve em `auth.uid()`, e só. Uma
assinatura que recebesse o id deixaria qualquer pessoa tirar um colega da
troca obrigatória, e a senha que o dono escolheu para ele continuaria
valendo em silêncio.

### Redefinir a senha de um funcionário

`POST /api/equipe/[id]/senha`: o dono digita uma senha nova e o handler
**zera `senha_definida_em`**. É o paliativo enquanto "Esqueci minha
senha" não existe (depende de SMTP, Fase 18).

Zerar a coluna não é detalhe: sem isso, "redefinir" seria uma porta
permanente para o dono conhecer a senha de qualquer funcionário quando
quisesse — e a autoria dos lançamentos deixaria de significar algo. Com
ela, a conta volta a ser só da pessoa em um passo.

O handler recusa qualquer perfil que não seja de funcionário. Um dono que
esquece a senha continua sendo caso de quem opera o Lida, no Studio.

## Limite de funcionários (Fase 16)

`organizations.limite_funcionarios`, `default 1`. É teto de pessoas
**ativas**: revogar um acesso libera a vaga na hora.

**A trava mora no gatilho `criar_perfil_no_cadastro`**, e não em policy
nem no Route Handler. O motivo é o de sempre: o handler usa a Admin API
com `service_role`, que ignora RLS — uma checagem só lá seria um `if` de
aplicação. No gatilho, ela vale para a tela, para o Studio e para
qualquer caminho futuro, e recusa com `LID70`.

Travar o Studio junto é proposital: você libera **subindo o limite**, não
contornando a regra. Assim o número na coluna é sempre a verdade sobre o
que foi vendido.

A tela esconde o botão antes disso — mas isso é UX, e cobre só o caminho
normal. O `LID70` é quem barra a corrida de duas abas e quem chama a API
na mão.
