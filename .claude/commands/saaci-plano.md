---
description: Monta o plano de implementação (4 branches, etapas e commits) antes de uma tarefa não trivial
argument-hint: <pedido, ou caminho de um briefing .md>
---

# /saaci-plano

Invoque a skill `saaci-plano` e siga o fluxo dela do início ao fim. O pedido do dev está em
`$ARGUMENTS`.

- Se `$ARGUMENTS` for o caminho de um arquivo `.md` (por exemplo, um briefing em `planos/`), leia o
  arquivo e trate o conteúdo como o pedido.
- Se vier vazio, pergunte o que o dev quer planejar.
- Não edite nada antes da aprovação explícita do plano.
