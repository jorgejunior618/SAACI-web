// Recusa o commit que altera doc/ sem uma ADR no mesmo commit.
import { execFileSync } from 'node:child_process'

const saida = execFileSync('git', ['diff', '--cached', '--name-status', '--no-renames'], {
  encoding: 'utf8',
})

const alterados = saida
  .split('\n')
  .filter(Boolean)
  .map((linha) => {
    const [status, caminho] = linha.split('\t')
    return { status, caminho }
  })

const ehAdr = (caminho) => /^doc\/adr\/(?!0000-)\d{4}-.+\.md$/.test(caminho)

const docsAlterados = alterados.filter(
  ({ caminho }) => caminho.startsWith('doc/') && !caminho.startsWith('doc/adr/'),
)
const temAdr = alterados.some(({ status, caminho }) => status !== 'D' && ehAdr(caminho))

if (docsAlterados.length > 0 && !temAdr) {
  console.error('\ndoc/ só muda junto com uma ADR.')
  console.error('Arquivos de doc/ neste commit:')
  for (const { caminho } of docsAlterados) console.error(`  - ${caminho}`)
  console.error('\nO que fazer:')
  console.error('  1. Copie doc/adr/0000-modelo.md para doc/adr/NNNN-titulo.md e preencha.')
  console.error('  2. Adicione a ADR ao commit (git add doc/adr/NNNN-titulo.md).')
  console.error('  3. Só correção de digitação, sem mudar regra: git commit --no-verify.\n')
  process.exit(1)
}
