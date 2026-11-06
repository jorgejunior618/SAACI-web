# Entrega de cada etapa

Implemente apenas o escopo da etapa aprovada. Ao terminar, pare e entregue o bloco abaixo, curto. Espere o sinal do dev antes da próxima etapa, a menos que ele tenha pedido todas em sequência.

## Bloco fixo

```markdown
**Mudou**

<até 3 linhas com o contexto geral da etapa>

<Tema> (UI, store, serviço...)

- [nome](caminho#Llinha): até 3 linhas com o que mudou, por quê e o trade-off ou risco, quando houver.

**Ganhos**

- <o que melhora>

**Checar**

- <riscos e o que não foi rodado>

**Teste manual sugerido**

- <passos curtos>

**Commit sugerido**

<mensagem pronta>

**Próxima etapa:** <uma linha>
```

## Regras

- Blocos por tema, em ordem de dependência: base primeiro, consumidores depois.
- Cada arquivo leva link clicável `[nome](caminho#Llinha)`.
- Não invente motivo. Se for inferência, diga.
- Em **Checar**, liste o que não foi rodado (`pnpm typecheck`, `pnpm lint`, `pnpm test`) e o comando sugerido.
- Em **Commit sugerido**, só a mensagem, sem executar.
- Etapa que envolve conceito avançado ou decisão não óbvia (design pattern, otimização de renderização) ganha 2 ou 3 linhas de explicação antes de seguir, com o porquê e o trade-off. Etapa trivial não precisa.
- Mudança que quebra contrato leva ALERTA em negrito no topo.
