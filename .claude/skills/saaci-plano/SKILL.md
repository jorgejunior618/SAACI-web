---
name: saaci-plano
description: Monta um plano de implementação antes de uma tarefa não trivial, com 4 opções de branch, pedido organizado, padrões do projeto conferidos, no máximo 4 etapas e a mensagem de commit pronta por etapa. Use quando o pedido mexe em mais de um arquivo ou tem decisão a tomar (feature, refatoração, correção que atravessa camadas), mesmo sem o dev chamar /saaci-plano. Não use para ajuste pontual de um arquivo, dúvida rápida, mensagem de commit isolada nem descrição de PR.
---

# saaci-plano

> Origem: skill `plano` do forward-kit (fwd 0.2.0), adaptada ao SAACI-web.

Organiza o pedido, confere o projeto, questiona o que for ambíguo e entrega um plano curto em etapas. Nada é editado antes da aprovação. Depois, executa uma etapa por vez, parando para o dev revisar.

## Quando usar

- O pedido é uma feature, correção ou refatoração que mexe em mais de um arquivo ou tem decisão a tomar. A skill entra sozinha nesses casos, e o dev também pode chamar `/saaci-plano`.

## Quando não usar

- Ajuste pontual de um arquivo, dúvida rápida ou correção de sintaxe. Responda direto.
- Mensagem de commit sem plano: é a skill `saaci-commit`.

## Fluxo

1. **Plan mode.** Se a sessão tiver o modo de plano, entre nele. Pesquisa, leitura e perguntas acontecem antes de qualquer edição.
2. **Organize o pedido.** Separe o que foi pedido do que é suposição. Liste o que está implícito (tipagem, TSDoc, estado global, tela nova) e o que falta para fechar o escopo.
3. **Confira o projeto**, tudo local:
   - Leia o `.claude/CLAUDE.md` e **só o documento de `doc/` da tarefa**, pela tabela "Antes de agir". Nunca carregue o `doc/` inteiro. A estrutura de pastas não muda sem aprovação: proponha, mostre a alternativa e espere.
   - Se o plano cria ou move componente, responda "onde ele mora?" com [../../references/promocao-componente.md](../../references/promocao-componente.md) e registre o destino na etapa (local, `components/` ou `@design-system`, e o `DS_REFERENCE.md` quando for o caso).
   - Procure como código parecido já foi resolvido (mesmo tipo de tela, mesmo hook, mesmo service). Convenção do projeto vale mais que boa prática genérica.
   - Mudar uma regra de `doc/` exige uma ADR no mesmo commit: se o plano precisa disso, vira uma etapa.
4. **Libs tocadas.** O uso atual está correto na versão instalada (`package.json`, tipos)? Há forma melhor que o projeto não usa? Diga se entra no escopo (barata e no caminho) ou fica como sugestão à parte.
5. **Pesquisa externa**, só com a trava: já olhei o código, o `package.json` e o `node_modules`; há gatilho real (lib nova no repo, decisão cara de reverter, suspeita de API depreciada, pedido do dev); a resposta muda o plano. No máximo 2 buscas em modo `standard`, específicas (lib, versão, dúvida exata), com aviso de 1 linha antes. Sem busca, marque "não confirmado".
6. **Perguntas**, em uma única rodada com `AskUserQuestion`. Pergunte só se a resposta muda o que será feito: decisão difícil de reverter, trade-off real, segurança ou dado sensível, breaking change, requisito ambíguo. Nome, estilo e boa prática óbvia você decide. Cada opção traz Complexidade, Risco e uma recomendação. Na mesma rodada, pergunte se o dev prefere o plano em Artifact ou direto no chat, se ele não disse.
7. **Apresente o plano** (abaixo) e peça aprovação explícita. Não execute nada antes.
8. **Execute etapa a etapa**, só depois da aprovação. O bloco de entrega de cada etapa está em [references/entrega.md](references/entrega.md).

## O plano

Cabe em cerca de uma tela, nesta ordem:

1. **ALERTA** em negrito no topo, só se houver breaking change (quebra contrato de API ou exige refatoração em outros componentes).
2. **Branch:** exatamente 4 opções, curtas e descritivas, em Conventional Commits (`feat/`, `fix/`, `refactor/`).
3. **O que e por quê:** 3 linhas, com a motivação real.
4. **Abordagem:** a escolhida e a alternativa descartada, com o motivo.
5. **Ganha e custa:** lista curta (performance, complexidade, manutenção).
6. **Etapas:** no máximo 4. Cada uma é uma entrega que compila, roda e se commita sozinha, e não é "uma etapa por arquivo". Junte o que anda junto (hook novo e o componente que o consome). Ordene por dependência. Por etapa: nome curto, escopo, arquivos, Complexidade, Risco e a mensagem de commit pronta.

## Mensagem de commit

Conventional Commits em PT-BR, com escopo, no imperativo presente (`feat(login): adiciona link de recuperação de senha`). Sem menção a ferramenta de IA nem coautoria.

## Regras

- Português do Brasil, direto.
- Antes da aprovação do plano, não rode teste, `tsc`, lint nem script. Depois, ao fechar cada etapa, rode `pnpm lint` e `pnpm typecheck`, e `pnpm test` quando a etapa muda comportamento. Se o dev pediu para só sugerir, sugira o comando.
- Nunca execute `git commit`, `git push` nem comando destrutivo. Só entregue a mensagem.
- Nunca comece a implementar sem aprovação explícita do plano.
- Mudança que quebre contrato leva ALERTA em negrito no topo, também na entrega da etapa.
