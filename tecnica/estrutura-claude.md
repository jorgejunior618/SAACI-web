# Estrutura do `.claude/`

Documenta o que existe em `.claude/` — skills, commands e arquivos de apoio —
e quando cada peça entra em ação. Espelha o padrão do projeto de referência
IRIS (`ceara-digital-mobile`): `SKILL.md`/`<comando>.md` curto e "roteador",
com detalhe delegado a `references/`.

## Árvore

```
.claude/
├── CLAUDE.md                       roteador de tarefa → doc técnico, regras sempre válidas
├── settings.json                   hook PostToolUse: eslint em .ts/.tsx pós edição
├── settings.local.json             model, permissions locais
├── references/
│   ├── regras-lida.md              fonte única de regras checáveis (services, arquitetura, TS, React Query, testes)
│   ├── regras-lida-grep.md         recorte crítico/grep-ável, usado por lida-padroes
│   └── formato-relatorio.md        template de relatório por severidade + veredicto
├── commands/
│   ├── lida-auditoria.md           /lida-auditoria
│   └── lida-revisar.md             /lida-revisar
└── skills/
    ├── lida-tarefa/SKILL.md        planeja 1 tarefa do roadmap
    ├── check-ds/                   audita src/@design-system/ (automática)
    │   ├── SKILL.md
    │   ├── regras.md
    │   └── relatorio.md
    ├── lida-padroes/SKILL.md       sinaliza quebra de arquitetura em src/ (automática)
    ├── lida-commit/                sugere mensagem de commit
    │   ├── SKILL.md
    │   └── exemplos.md
    └── lida-copy/                  revisa texto do usuário final
        ├── SKILL.md
        ├── criterios.md
        └── glossario.md
```

## Skills Disponíveis

| Situação                                                     | Skill          | Automática?                                           |
| ------------------------------------------------------------ | -------------- | ----------------------------------------------------- |
| Planejar uma tarefa solta do roadmap                         | `lida-tarefa`  | Não — sob demanda                                     |
| Criar ou editar componente em `src/@design-system/`          | `check-ds`     | Sim — dispara ao Edit/Write nesse caminho             |
| Criar ou editar código em `src/` (services, features, rotas) | `lida-padroes` | Sim — dispara ao Edit/Write de `.ts`/`.tsx` em `src/` |
| Sugerir mensagem de commit                                   | `lida-commit`  | Não — sob demanda                                     |
| Revisar texto exibido ao usuário final                       | `lida-copy`    | Não — sob demanda                                     |

Automática aqui significa que a `description` da skill instrui o agente a
usá-la proativamente — não existe hook técnico do Claude Code forçando a
invocação. Ver a seção "Limitação conhecida" de `lida-padroes/SKILL.md`.

## Commands Disponíveis

| Situação                                             | Command                   |
| ---------------------------------------------------- | ------------------------- |
| Planejar uma tarefa solta do roadmap                 | `/lida-tarefa`            |
| Auditar o diff da branch atual antes de abrir PR     | `/lida-auditoria`         |
| Revisão profunda de 1 arquivo, com gate de aprovação | `/lida-revisar <arquivo>` |

## Mapa de referência rápida

| Caminho                                   | O que é                                                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `.claude/references/regras-lida.md`       | fonte única de regras gerais — services, arquitetura, TypeScript, React Query, testes                       |
| `.claude/references/regras-lida-grep.md`  | recorte crítico/grep-ável derivado de `regras-lida.md`, consumido por `lida-padroes`                        |
| `.claude/references/formato-relatorio.md` | template de relatório e veredicto, compartilhado por `/lida-auditoria`, `/lida-revisar` e `check-ds`        |
| `.claude/skills/check-ds/regras.md`       | regras de Design System, derivadas de `doc/tecnica/design-system.md` — domínio separado de `regras-lida.md` |

## Decisões conscientes de não duplicar skill global

`lida-commit` e `lida-copy` existem apesar de o usuário já ter skills globais
equivalentes (`j-commit`, `j-linguagem-simples`) — decisão explícita de manter
essas duas versionadas no repositório, com vocabulário e exemplos do domínio
do Lida, em vez de depender só de configuração pessoal fora do projeto.
