# Checklist: onde o componente mora

Usado por `saaci-plano`, `/saaci-auditar` e `/saaci-revisar-codigo`. As regras vêm de
`doc/design-system.md` (O que entra, Promoção), `doc/estrutura-pastas.md` (Onde criar, Regras) e
`doc/convencoes-codigo.md` (Quebra de componente). Este arquivo só diz como conferir; não cria regra.

## Perguntas, em ordem

1. **Está no catálogo do design system?** Se sim, nasce em `@design-system/<nível>/`, mesmo sem
   tela usando, e entra no `DS_REFERENCE.md` no mesmo commit. Se não, siga adiante.
2. **Quantas telas usam hoje?** Uma só: fica em `_components/` da tela. Subir por antecipação
   ("vamos precisar") não é aceito; sobe quando a **segunda** tela precisa.
3. **Duas ou mais telas, e tem lógica?** Todas do mesmo domínio e fora do catálogo do DS:
   `features/<dominio>/_components/<Componente>/` (ADR 0005). De domínios diferentes: chama
   `services/` ou decide navegação, `components/<Componente>/`; UI pura, `@design-system/<nível>/`.
4. **Subiu por qual caminho?** Foi **movido**, com uma origem só. Cópia entre telas não é aceita.
5. **É variação de algo existente?** Se só difere em conteúdo ou formatação, é o mesmo atom com
   prop, não um componente novo.
6. **Fronteira de import.** `@design-system` nunca importa `services/`, `features/`,
   `next/navigation` nem `@supabase`. Uma feature não importa o `_components/` de outra.
7. **Registro.** Componente novo ou alterado em `@design-system` com `DS_REFERENCE.md` atualizado
   no mesmo commit, e especificado e validado pela equipe.

## Severidade na auditoria e na revisão

| Achado                                                                               | Severidade |
| ------------------------------------------------------------------------------------ | ---------- |
| `@design-system` importando `services/`, `features/`, `next/navigation`, `@supabase` | Crítico    |
| Cópia do mesmo componente em duas telas, ou `_components/` importado por outra tela  | Médio      |
| Componente promovido por antecipação ou fora do catálogo sem validação da equipe     | Médio      |
| Componente com lógica em `@design-system`, ou UI pura em `components/`               | Médio      |
| `DS_REFERENCE.md` sem o componente novo ou alterado                                  | Médio      |
| Dois componentes que deveriam ser um atom com prop                                   | Médio      |
