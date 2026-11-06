// Hook PostToolUse (Edit|Write) do Claude Code: roda o ESLint no .ts/.tsx recém-editado e devolve
// os erros ao Claude. Sai com 0 quando o arquivo está limpo ou quando não há o que checar, e com 2
// (stderr vai para o Claude) quando o ESLint reporta erro. Configurado em .claude/settings.json.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const MAX_LINHAS = 12

function lerEntrada() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return {}
  }
}

const arquivo = lerEntrada().tool_input?.file_path ?? ''
const raiz = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const eslint = join(raiz, 'node_modules', 'eslint', 'bin', 'eslint.js')

if (!/\.(ts|tsx)$/.test(arquivo) || !existsSync(eslint)) process.exit(0)

try {
  execFileSync(process.execPath, [eslint, '--no-warn-ignored', arquivo], {
    cwd: raiz,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
} catch (erro) {
  const saida = String(erro.stdout ?? '').trim()

  if (saida) {
    console.error(saida.split('\n').slice(0, MAX_LINHAS).join('\n'))
    process.exit(2)
  }
}
