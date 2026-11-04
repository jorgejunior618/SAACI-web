# Provisionamento manual

Runbook operacional — passo a passo de tela, não decisão de arquitetura.
As decisões por trás de cada ação (por que é manual, por que fica no
Auth Hook) estão em `decisoes.md` e `rls-e-permissoes.md`; aqui só o
"como fazer", pensado para quem está operando o sistema no dia a dia, não
programando.

**Este documento é vivo.** Atualize sempre que aparecer um passo novo no
processo — cadastro de funcionário, reativação de acesso, qualquer
operação manual que hoje não tem tela própria no produto.

## Onde entrar

| Ambiente    | URL                                                                                        | Quando usar                      |
| ----------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| Local (dev) | `http://127.0.0.1:54323`, depois de `supabase start`                                       | Sempre que estiver desenvolvendo |
| Produção    | _(pendente — projeto de produção ainda não existe; ver `tecnologia.md`, seção Hospedagem)_ | Quando houver cliente pagante    |

Sem login: o Studio local não pede senha. O de produção pede login da
sua conta Supabase.

## Criar uma organização nova (dono)

Não existe autocadastro — todo dono entra no sistema porque você criou o
acesso dele manualmente.

> ⚠️ **Ao criar o projeto de produção, confira `enable_signup`.** O padrão
> do Supabase é `true`, e com ele qualquer pessoa com a chave pública
> `anon` cria uma organização inteira pelo `/auth/v1/signup`. No projeto
> hospedado a opção fica em **Authentication → Sign In / Providers →
> Allow new users to sign up**, e precisa estar **desligada**.
>
> Não confunda com "Email provider": desligar aquele derruba o login por
> e-mail e senha, e ninguém entra. Detalhe em `doc/rls-e-permissoes.md`.

1. **Authentication → Users → Add user → Create new user.**
2. Preencher **Email** e **Password** com os dados reais do dono.
3. Marcar **Auto Confirm User**. Sem isso, o Supabase espera confirmação
   por e-mail antes de liberar o login — desnecessário aqui, porque a
   conta já nasce de confiança direta.
4. No campo de metadata do usuário (**User Metadata** / **Raw User Meta
   Data**, dependendo da versão da tela), colar:
   ```json
   { "nome_fazenda": "Nome da Fazenda", "nome": "Nome do Dono" }
   ```
5. **Create user.** Isso dispara o gatilho `criar_perfil_no_cadastro`
   (`supabase/migrations/20260801220000_auth_hook_e_perfil.sql`), que na
   mesma transação:
   - cria a organização com o nome de `nome_fazenda`;
   - cria o perfil do usuário com `papel = dono`;
   - cria o cliente de sistema "Avulso" dessa organização.
6. **Conferir:** Table Editor → `profiles` → a linha nova deve ter
   `organization_id` preenchido e `papel = dono`. Se o cadastro falhar
   (por exemplo, "nome" vazio), o Supabase mostra o erro na hora e nada é
   criado — não sobra usuário órfão.

## Adicionar um funcionário a uma organização existente

> **Desde a Fase 16, este não é mais o caminho normal.** O dono cria o
> acesso sozinho, em **Configurações → Criar acesso**, e é lá que ele
> escolhe nome, e-mail, senha inicial e as duas capacidades. O passo a
> passo abaixo continua valendo como saída de emergência — dono sem
> acesso à própria tela, ou conta de suporte.
>
> **Corrigir nome ou e-mail de um acesso já criado também é operação
> daqui.** O produto não tem tela de edição de acesso — o dono cria,
> liga/desliga as duas capacidades e remove; nada mais. Errou o e-mail
> logo depois de criar, o caminho normal é remover o acesso e criar de
> novo pela tela.
>
> Se precisar corrigir à mão, lembre que o e-mail vive em **dois
> lugares**: `auth.users.email` (quem autentica) e `profiles.email` (o
> espelho que a tela lê). Alterar um sem o outro faz a tela mostrar um
> endereço e a pessoa entrar por outro — sem erro em lugar nenhum.
> Altere os dois, sempre.

1. Descobrir o `organization_id` da fazenda: **Table Editor →
   organizations**, localizar a linha pelo nome, copiar o `id`.
2. **Authentication → Users → Add user → Create new user**, mesmo
   caminho do dono, mas a metadata muda:

   ```json
   {
     "organization_id": "<id copiado acima>",
     "papel": "funcionario",
     "nome": "Nome do Funcionário",
     "pode_lancar_pagamento": false,
     "pode_lancar_despesa": false
   }
   ```

   As duas capacidades são opcionais e valem `false` quando ausentes — o
   default do sistema é negar. Elas entraram na metadata na Fase 16, para
   que o perfil nasça com a permissão certa numa transação só, em vez de
   depender de um `update` posterior que pode falhar sozinho.

3. **Create user.** O mesmo gatilho reconhece `organization_id` presente
   na metadata e segue o segundo caminho: vincula o perfil à organização
   já existente, sem criar organização nem cliente "Avulso" novos.
4. **Conferir:** mesmo passo do dono — `profiles`, mas agora com
   `papel = funcionario` e o `organization_id` da fazenda certa.

## Remover o acesso de um funcionário

Tem tela desde a Fase 16 — **Configurações → Remover** — e é por lá que
se faz. Fica registrado aqui o que a tela executa, porque o efeito no
banco não é óbvio:

- Grava `profiles.acesso_removido_em`. **Não apaga a linha**: o banco
  recusaria por causa do histórico, e o nome da pessoa precisa continuar
  nos pedidos que ela lançou.
- Banir no GoTrue (`Authentication → Users → ⋯ → Ban user`) é o que
  derruba a sessão já aberta. A tela faz os dois; se você fizer à mão,
  fazer só o ban **não** revoga (o token seguinte volta a valer), e fazer
  só a coluna deixa a sessão aberta viva até a próxima renovação.

**Reativar** não tem tela: apagar `acesso_removido_em` e remover o ban.

## Liberar mais acessos de funcionário (upsell)

Toda fazenda nasce com **1 acesso de funcionário**
(`organizations.limite_funcionarios`, default 1). Ao bater o teto, a tela
de Configurações troca o botão "Criar acesso" por um convite a entrar em
contato — sem exibir preço, que é combinado por conversa.

1. **Table Editor → organizations**, localizar a fazenda pelo nome.
2. Editar `limite_funcionarios` para o número combinado.
3. Salvar. O efeito é **imediato**: a trava é contada no momento da
   criação, não vem de claim, então não depende de ninguém relogar.

**Conferir:** o dono recarrega Configurações e o botão "Criar acesso"
volta a aparecer.

> Remover o acesso de alguém libera a vaga na hora. Se a fazenda só
> trocou de funcionário, ela não precisa de acesso a mais — a tela diz
> isso, mas vale repetir na conversa.

## Redefinir a senha de alguém

**Funcionário:** o dono faz sozinho, em **Configurações → Nova senha**.
Ele digita uma senha, passa para a pessoa, e ela cria a própria no acesso
seguinte.

**Dono:** é caso seu, no Studio — **Authentication → Users**, localizar o
usuário, e usar a opção de definir senha. Depois, zere a marca para que
ele seja obrigado a criar a própria:

```sql
update profiles set senha_definida_em = null where id = '<id do usuário>';
```

Sem esse `update`, a senha que **você** escolheu continua valendo
indefinidamente na conta de um cliente.

> "Esqueci minha senha" por e-mail não existe: depende de SMTP
> contratado, que é decisão de infraestrutura da Fase 18.

## Pausar uma organização (inadimplência)

Não existe tela para isso, e não vai existir: uma tela em que o dono
despausa a própria organização anularia a coluna. É inadimplência da
fazenda inteira, decidida por você. Pausar é uma edição direta em
`organizations.pausada_em`:

1. **Table Editor → organizations**, localizar a fazenda pelo nome.
2. Editar a célula `pausada_em`, preenchendo com a data/hora atual (ou
   qualquer timestamp — o que importa é não estar nula).
3. Salvar.

**Reativar** é o mesmo caminho ao contrário: apagar o valor de
`pausada_em`, deixando a célula vazia (`null`) de novo.

### Quando o efeito aparece para quem já está logado

A leitura de `pausada_em` acontece dentro do Auth Hook
(`custom_access_token_hook`), que só roda quando um token novo é emitido
— no login, e depois a cada renovação. Uma sessão que já estava aberta
no momento da pausa **não cai na hora**; o bloqueio vale a partir da
próxima renovação de token, que acontece automaticamente em até
`jwt_expiry` (hoje 1h em desenvolvimento local, configurado em
`supabase/config.toml`). Não é instantâneo, mas também não depende de a
pessoa relogar sozinha.

**Conferir:** Table Editor → `organizations`, coluna `pausada_em`
preenchida na fazenda certa.

## Pendências

- **Criar organização nova (dono)** continua sem tela, e é o caso que
  mais aparece — todo cliente novo passa por aqui. Não tem fase no
  roadmap: quem provisiona é você, não o produto.
- **"Esqueci minha senha" por e-mail** não existe — depende de SMTP
  contratado, domínio verificado e templates (Fase 18). Até lá, o dono
  redefine a do funcionário pela tela, e a do dono é caso seu, no Studio
  (seção acima).
- **Trocar o papel de um funcionário** está barrado no banco desde a
  Fase 16 (`profiles_congela_identidade`), inclusive para `postgres`. Se
  a operação aparecer na prática, a exceção nasce nomeada naquele
  trigger — não removendo o congelamento.
