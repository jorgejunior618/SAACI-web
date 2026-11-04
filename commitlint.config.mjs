// Conventional Commits com assunto em português: a regra padrão de case (subject-case) assume
// inglês e recusaria "adiciona X", "corrige Y" etc.
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
  },
}

export default config
