# Estrutura de pastas

```
SAACI-web/
├── .claude/CLAUDE.md
├── doc/
├── tests/                        testes de regra do repositório inteiro
├── panda.config.ts
└── src/
    ├── app/                      rota, layout, prefetch. Nada mais
    │   ├── (auth)/               login, cadastro, recuperar-senha
    │   ├── (verificacao)/        verificacao (RF05)
    │   ├── (curso)/              curso (primeiro login e troca sem atividades)
    │   ├── (aluno)/              painel, atividades, atividades/[id], formulario, eventos, perfil
    │   ├── (tarefa)/             atividades/nova, atividades/[id]/corrigir, formulario/previa
    │   └── (livre)/              redefinir-senha, privacidade, conta-apagada
    ├── features/<dominio>/<Tela>/
    │   ├── index.tsx  styles.ts  types.ts  schema.ts
    │   ├── Loading.tsx  Error.tsx  Empty.tsx
    │   └── _components/<Componente>/{index.tsx,styles.ts}
    ├── components/<Componente>/  2+ telas E lógica além de UI
    ├── services/<dominio>/       origem do dado (hoje, mock)
    ├── @design-system/           tokens, atoms, molecules, organisms, templates
    ├── providers/                query-client/, QueryProvider/
    ├── hooks/                    hooks globais
    ├── utils/                    puros
    │   └── tests/                asserções reusadas entre testes
    ├── constants/
    └── styled-system/            gerado pelo Panda, fora do git
```

## Onde criar

| Vou criar                                | Vai em                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| Rota nova                                | `app/<grupo>/<rota>/page.tsx`, só importando a feature |
| Tela                                     | `features/<dominio>/<Tela>/index.tsx`                  |
| Sub-componente de uma tela só            | `features/<dominio>/<Tela>/_components/<Componente>/`  |
| Componente puro de UI, em 2+ telas       | `@design-system/<nível>/`                              |
| Componente com lógica, em 2+ telas/rotas | `components/<Componente>/`                             |
| Leitura de dado                          | `services/<dominio>/<dominio>.api.ts`                  |
| Escrita de dado                          | `services/<dominio>/<dominio>.mutations.ts`            |
| Dado de exemplo de um domínio            | `services/<dominio>/<dominio>.mock.ts`                 |
| Schema Valibot de formulário             | `schema.ts` ao lado do `index.tsx`                     |
| Schema Valibot do domínio                | `services/<dominio>/<dominio>.types.ts`                |
| Helper puro de uma tela                  | `utils.ts` ao lado do `index.tsx`                      |
| Helper puro usado em 2+ lugares          | `src/utils/`                                           |

## Domínios

| Domínio        | `features/` | `services/` | Responde por                   |
| -------------- | ----------- | ----------- | ------------------------------ |
| `autenticacao` | sim         | a criar     | sessão e conta (mock)          |
| `atividades`   | sim         | sim         | registro e comprovante         |
| `painel`       | sim         | não         | composição do progresso        |
| `resumo`       | sim         | não         | composição do progresso        |
| `formulario`   | sim         | não         | composição do progresso        |
| `perfil`       | sim         | a criar     | curso e semestre               |
| `regras`       | não         | a criar     | categorias, conversão, limites |
| `progresso`    | não         | a criar     | cálculo único de horas (RNF20) |

Feature sem service é tela que só compõe. Service novo aparece quando a métrica tem dono próprio.

## Grupos de rota

| Grupo           | Sessão (`SessionGate`)      | Barra inferior |
| --------------- | --------------------------- | -------------- |
| `(auth)`        | só sem sessão               | não            |
| `(verificacao)` | e-mail ainda não confirmado | não            |
| `(curso)`       | e-mail confirmado           | não            |
| `(aluno)`       | conta com curso             | sim            |
| `(tarefa)`      | conta com curso             | não            |
| `(livre)`       | nenhuma                     | não            |

Quem chega no grupo errado vai para o lugar certo: Entrar, Confirme seu e-mail, Seu curso ou Início.

## Arquivos de convenção do Next

| Arquivo         | Onde mora                                               |
| --------------- | ------------------------------------------------------- |
| `page.tsx`      | toda rota, com `export const metadata` do título da aba |
| `loading.tsx`   | rota que suspende, reexporta o `Loading` da feature     |
| `error.tsx`     | um por grupo, reexportando `components/ErroDeTela`      |
| `not-found.tsx` | raiz, um por grupo e um por entidade                    |

## Aliases

```ts
"@/*"            → src/*
"@design-system" → src/@design-system
```

## Regras

- Feature importa `@/services/<dominio>`, nunca um arquivo interno do domínio (ESLint garante).
- `@design-system` é UI pura: nunca importa `services/`, `features/` ou `next/navigation`.
- `app/` nunca contém componente de UI, estilo ou regra de negócio.
- Arquivo interno de um módulo não importa do `index.ts` do próprio módulo.
- Pasta auxiliar tem underscore e plural: `_components/`, `_hooks/`.
- Máximo 2 níveis dentro de um domínio: `<dominio>/<Tela>/`.
- Componente em `_components/` é pasta com `index.tsx` e `styles.ts`, nunca `.tsx` solto.
- O `styles.ts` da tela guarda só o que a tela usa.
