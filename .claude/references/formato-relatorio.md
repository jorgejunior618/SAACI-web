# Formato de relatório: auditoria e revisão

Usado por `/saaci-auditar` e `/saaci-revisar-codigo`. Toda saída desses comandos segue esta
estrutura. O relatório é só diagnóstico: corrigir é decisão separada.

## Seções por severidade

Cada achado aparece uma vez, na seção da sua severidade, nesta ordem:

```markdown
## Crítico

- **arquivo:linha**: regra violada (curta), com o `doc/` de origem. Trecho relevante do código.

## Médio

- **arquivo:linha**: regra violada (curta), com o `doc/` de origem. Trecho relevante do código.

## Baixo

- **arquivo:linha**: regra violada (curta), com o `doc/` de origem. Trecho relevante do código.
```

Seção sem achado é omitida, sem título vazio.

## Régua de severidade

A regra em si vem do `doc/`. Esta régua só decide o peso:

| Severidade | Quando                                                                                | Exemplos                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Crítico    | O erro é **silencioso** ou rompe uma fronteira: o dado sai errado sem sintoma na tela | `any`; feature importando o mock ou `supabase-js`; horas calculadas fora do cálculo único; `enabled` em suspense; mutation que deixa um total velho; chave de cache escrita à mão |
| Médio      | A convenção degrada manutenção ou experiência, mas a tela continua certa              | `css()` fora de `styles.ts`; falta `Loading.tsx` ou `Empty.tsx`; `useQuery` sem comentário do porquê; `DS_REFERENCE.md` desatualizado                                             |
| Baixo      | Estilo, nome ou melhoria qualitativa                                                  | Nome de função sem o domínio; booleano sem `is`/`has`/`can`; símbolo exportado sem TSDoc                                                                                          |

Na dúvida entre dois níveis, pergunte: se isso quebrar, alguém percebe olhando a tela? Se não,
suba um nível.

## Veredicto final

Sempre a última linha do relatório, em negrito, um dos três estados:

- **APROVADO**: nenhum achado Crítico ou Médio.
- **ATENÇÃO**: só achados Médio e/ou Baixo pendentes. Não bloqueia, mas vale corrigir.
- **BLOQUEADO**: pelo menos um achado Crítico pendente.

## Regra de uso

`/saaci-auditar` nunca corrige. `/saaci-revisar-codigo` só corrige com aprovação explícita do
usuário, e nunca aplica item Baixo sozinho.
