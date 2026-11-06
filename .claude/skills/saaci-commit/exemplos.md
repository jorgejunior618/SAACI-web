# Exemplos: saaci-commit

Todos saíram do histórico do projeto ou seguem o mesmo padrão.

## feat simples, sem escopo

```
feat: cria conta de exemplo pelo painel Mock
```

## feat com escopo

```
feat(claude): adiciona hook de ESLint e comandos de auditoria e revisão
```

## docs com corpo (o porquê não é óbvio pelo assunto)

```
docs: enxuga a documentação técnica para o escopo do TCC

Mantém todas as regras e corta o histórico de bugs antigos e o detalhe de Supabase ainda não usado.
Passa a ter regra, um porquê curto e um exemplo em cada arquivo de doc/.
```

## refactor

```
refactor: reduz sessão e mock ao login e adiciona página pós-login
```

## chore

```
chore: remove fundo e comprime as logos de public
```

## breaking change

```
refactor(services)!: renomeia entrar para signIn

BREAKING CHANGE: telas que chamavam entrar precisam trocar para signIn. O retorno continua sendo a
sessão.
```

## diff que deveria virar dois commits

Se o diff mexe em `conta.api.ts` (nova leitura) e também corrige um erro de texto no `Login`, separe:

```
1º commit: feat(services): valida a sessão com Valibot na saída do service
2º commit: fix: corrige a mensagem de senha incorreta no login
```

## diff que toca doc/ sem ADR

Avise antes da mensagem: "este diff altera `doc/convencoes-codigo.md`; o hook de commit vai exigir
uma ADR em `doc/adr/` no mesmo commit".
