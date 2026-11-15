# 0007. A tela Conta apagada fica fora dos grupos de rota e sem `SessionGate`

- **Status:** Proposta
- **Data:** 15/11/2026

## Contexto

Excluir conta (RF33, ADR 0006) apaga a conta e encerra a sessão. Em seguida o aluno precisa ler a
confirmação: o que sai dos sistemas e até quando (RNF05). Cada grupo de rota tem um `SessionGate`, e
todos redirecionam alguém: `(aluno)` e `(conta)` mandam quem não tem sessão para `/entrar`, e
`(publico)` manda quem ainda tem sessão em cache para `/inicio`. Colocada em qualquer grupo, a tela
corre o risco de ser trocada por outra antes de ser lida. Com `(publico)`, isso decorre de
`getSessionRedirect` e da sessão que ainda está no cache logo depois de apagar; não foi reproduzido
no navegador.

Para as telas de conta que valem com ou sem curso (Excluir conta, hoje), também faltava um grupo: o
`(onboarding)` só atende quem ainda não escolheu o curso, e o `(aluno)` só quem já escolheu.

## Decisão

- `app/conta-apagada/` fica na raiz de `app/`, fora de qualquer grupo e sem `SessionGate`. A tela é
  estática e não lê dado do aluno.
- Quem apaga a conta esvazia o cache (RNF04) e só então navega para `/conta-apagada`.
- Nasce o grupo `(conta)`, com `SessionGate mode="account"`: exige sessão e não olha o curso. Excluir
  conta mora nele.
- A exceção da raiz entra por nome em `doc/arquitetura.md`, na tabela de exceções nomeadas.

## Consequências

- Uma rota fora da regra "um `SessionGate` por grupo". Qualquer pessoa, com ou sem sessão, abre
  `/conta-apagada`, e ela não mostra dado nenhum.
- Um grupo e um modo de gate a mais para conhecer. Excluir conta passa a funcionar para quem já tem
  curso, o que antes era impossível.
- Obrigação de quem contribui: nenhuma tela nova entra na raiz de `app/` por este precedente. Tela
  sem gate precisa de ADR própria.
- Com o Supabase, a exceção continua valendo: a sessão é encerrada no servidor junto com a conta.

## Alternativas descartadas

- Colocar `/conta-apagada` em `(publico)`: o gate leria a sessão ainda em cache e mandaria o aluno
  para `/inicio` antes de a confirmação aparecer.
- Esvaziar o cache e navegar de dentro de `(conta)`: o gate do grupo, ainda montado, perderia a sessão
  e redirecionaria para `/entrar` numa corrida com a navegação.
- Mostrar a confirmação dentro do Perfil: deixaria dado do aluno na memória por mais tempo (RNF04) e
  um refetch da sessão poderia redirecionar no meio.
- Reusar `(onboarding)` para Excluir conta: o grupo só atende quem ainda não escolheu o curso.
