# 0006. Apagar a conta por função SQL `security definer`, sem Route Handler nem `service_role`

- **Status:** Proposta
- **Data:** 12/11/2026

## Contexto

O aluno apaga a própria conta (RF33). Remover o usuário de `auth.users` exige o dono do schema ou a
chave `service_role`, que ignora RLS. `rls-e-permissoes.md` previa um Route Handler
`DELETE /api/conta` com um cliente admin, descrito como a fronteira mais perigosa do sistema.

A integração da conta (issue #17) implementou outro caminho: a função `public.apagar_minha_conta()`,
`security definer`, chamada por RPC. `arquitetura.md` manda registrar por nome todo
`security definer` antes de escrevê-lo, e isso não foi feito. Esta ADR registra a decisão e ajusta os
dois documentos que a contradiziam.

## Decisão

- **`public.apagar_minha_conta()` é a segunda função `security definer` registrada**, ao lado de
  `apagar_contas_nao_confirmadas` (ADR 0003). Ela apaga só a linha de `auth.uid()`, não recebe o dono
  por parâmetro, devolve apenas quantas contas apagou (0 ou 1) e usa `search_path` vazio.
- **Só `authenticated` a executa.** A migration tira `execute` de `public` e de `anon`.
- **O service `deleteAccount(password)` pede a senha de novo.** Ele a confere com
  `signInWithPassword`, chama a RPC e encerra a sessão local (`signOut({ scope: 'local' })`), porque a
  sessão no servidor some junto com o usuário.
- **Perfil e atividades saem em cascata** (`on delete cascade` para `auth.users`, em cada tabela do
  aluno). Os arquivos do Storage saem por rotina agendada (`[PRAZO DO RNF05]`).
- **Não existe Route Handler `DELETE /api/conta` nem cliente admin.** A chave `service_role` segue
  fora do projeto.

## Consequências

- A confirmação por senha é feita no navegador, e o servidor não a exige: quem tem sessão válida pode
  chamar a RPC direto. Isso é aceito porque a sessão já identifica o dono do dado (RNF04), e a senha
  protege contra clique acidental e aparelho emprestado. Um Route Handler poderia impor a senha no
  servidor, e esse é o custo desta escolha.
- Toda tabela do aluno que nascer referencia `auth.users` com `on delete cascade`. Esquecer deixa
  dado órfão.
- Os arquivos do Storage ficam órfãos até a rotina agendada existir.
- A função é testada com pgTAP (`apagar_minha_conta.test.sql`) e pelo fluxo de integração
  (`pnpm test:rls`), e vimos o teste falhar com o `where` removido.
- `arquitetura.md` e `rls-e-permissoes.md` mudam neste commit.
- A implementação da #17 desmentiu dois pontos da ADR 0003, que segue como Proposta e não é editada
  aqui: o link do e-mail leva só `?token=<token_hash>`, sem `type` (a rota define o tipo), e o erro
  `P0001` do gatilho de troca de e-mail chega ao navegador como HTTP 500 com a mensagem genérica
  "Error sending email change email". O service não o traduz, e a tela de Perfil valida o domínio
  antes de chamar o Auth.

## Alternativas descartadas

- **Route Handler com `service_role`.** Põe no servidor um segredo que ignora RLS, cria uma rota para
  proteger e leva a mudança para fora de `services/`, tudo para uma tarefa que só mexe no banco. É o
  mesmo raciocínio da limpeza de contas na ADR 0003.
- **Edge Function com `service_role`.** Mesmos custos do Route Handler, mais um deploy à parte.
- **RPC que confere a senha no banco.** Exigiria ler o hash de `auth.users` dentro de uma função
  `security definer`, ampliando o que ela enxerga.
