# 0017. Prazo de 7 dias para apagar os dados depois da exclusão da conta (RNF05)

- **Status:** Proposta
- **Data:** 21/11/2026

## Contexto

O RNF05 manda dizer ao aluno em quanto tempo os dados somem depois que ele apaga a conta. O valor
nunca foi fixado: `modelagem-dados.md`, as ADRs 0006 e 0011, a migration `apaga_minha_conta`, o service
e a tela Conta apagada carregavam o marcador `[PRAZO DO RNF05]`. Sem número, a tela promete algo que
ninguém definiu.

## Decisão

- **O prazo é de 7 dias**, contados da exclusão, para o aluno, as atividades, os comprovantes e as
  cópias de segurança.
- O banco apaga na hora, por `apagar_minha_conta()` (ADR 0006). Os arquivos do Storage saem pela rotina
  `limpa-comprovantes`, de hora em hora (ADR 0011). Os 7 dias são o teto, não o ritmo normal.
- A tela Conta apagada e o Aviso de privacidade dizem "7 dias". O número mora em uma constante só,
  para as duas telas não divergirem.
- O marcador `[E-MAIL DE CONFIRMAÇÃO DA EXCLUSÃO]` continua: o e-mail não existe no service e esta ADR
  não o cria.

## Consequências

- Some o marcador `[PRAZO DO RNF05]` de `modelagem-dados.md`, da tela e dos comentários.
- Quem opera o Supabase precisa conferir se o plano contratado guarda backup por até 7 dias. Se
  guardar por mais, o texto "inclusive cópias de segurança" fica falso e o prazo muda numa ADR nova.
- As ADRs 0006 e 0011 não são editadas: continuam citando o marcador, e esta ADR é quem o resolve.

## Alternativas descartadas

- **30 dias.** Cobre qualquer retenção de backup, mas deixa o dado de quem pediu para sair por mais
  tempo do que o produto precisa.
- **Manter o marcador até a coordenação responder.** Bloqueia a tela e o aviso de privacidade por uma
  decisão que o time já tomou.
