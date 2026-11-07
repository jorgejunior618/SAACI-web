// Recusa a alteração em doc/ sem uma ADR junto. Dois modos:
//   node scripts/check-adr.mjs                     hook de pre-commit: confere o que está em stage
//   node scripts/check-adr.mjs --range base...head CI: confere o intervalo inteiro de um PR
import { execFileSync } from 'node:child_process'

const indice = process.argv.indexOf('--range')
const intervalo = indice >= 0 ? process.argv[indice + 1] : null

if (indice >= 0 && !intervalo) {
  console.error('Faltou o intervalo: --range <base>...<head>')
  process.exit(2)
}

const argumentosGit = intervalo
  ? ['diff', '--name-status', '--no-renames', intervalo]
  : ['diff', '--cached', '--name-status', '--no-renames']

const saida = execFileSync('git', argumentosGit, { encoding: 'utf8' })

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
  const escopo = intervalo ? 'neste PR' : 'neste commit'

  if (intervalo) {
    // Anotação do GitHub Actions: aparece no resumo da execução.
    console.log(
      `::warning title=doc/ sem ADR::${docsAlterados.length} arquivo(s) de doc/ ${escopo} sem ADR em doc/adr/`,
    )
  }

  console.error('\ndoc/ só muda junto com uma ADR.')
  console.error(`Arquivos de doc/ ${escopo}:`)
  for (const { caminho } of docsAlterados) console.error(`  - ${caminho}`)
  console.error('\nO que fazer:')
  console.error('  1. Copie doc/adr/0000-modelo.md para doc/adr/NNNN-titulo.md e preencha.')
  console.error('  2. Adicione a ADR junto (git add doc/adr/NNNN-titulo.md).')
  console.error('  3. Só correção de digitação, sem mudar regra: git commit --no-verify.\n')
  process.exit(1)
}
