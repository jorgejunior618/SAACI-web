// Calcula a próxima versão (semver) a partir dos Conventional Commits desde a última tag `vX.Y.Z`
// (ADR 0022). Imprime só a versão, sem o `v`. Roda no workflow de release e localmente:
//   node scripts/next-version.mjs            próxima versão pelos commits
//   node scripts/next-version.mjs 1.0.0      confere e devolve a versão pedida
//
// Regras: breaking change (`!:` no assunto ou `BREAKING CHANGE:` no corpo) sobe o major, mas o
// minor enquanto a versão for 0.x; `feat` sobe o minor; `fix` e `perf` sobem o patch. Os outros
// tipos não geram release. Sem tag nenhuma, a primeira versão é 0.1.0.
import { execFileSync } from 'node:child_process'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const semver = /^(\d+)\.(\d+)\.(\d+)$/

const tags = git('tag', '--list', 'v*', '--sort=-v:refname', '--merged', 'HEAD')
  .split('\n')
  .filter((tag) => semver.test(tag.slice(1)))
const ultimaTag = tags[0] ?? null

const pedida = process.argv[2]
if (pedida) {
  if (!semver.test(pedida)) {
    console.error(`Versão inválida: "${pedida}". Use o formato X.Y.Z, sem o "v".`)
    process.exit(2)
  }
  if (tags.includes(`v${pedida}`)) {
    console.error(`A tag v${pedida} já existe. Escolha outra versão.`)
    process.exit(2)
  }
  console.log(pedida)
  process.exit(0)
}

if (!ultimaTag) {
  console.log('0.1.0')
  process.exit(0)
}

// Assunto e corpo de cada commit, separados por um caractere que não aparece em mensagem.
const commits = git('log', '--no-merges', '--format=%s%n%b%x1e', `${ultimaTag}..HEAD`)
  .split('\x1e')
  .map((mensagem) => mensagem.trim())
  .filter(Boolean)

let nivel = 0 // 0 nada, 1 patch, 2 minor, 3 major
for (const mensagem of commits) {
  const [assunto] = mensagem.split('\n')
  const tipo = /^(\w+)(\([^)]*\))?(!)?:/.exec(assunto)
  if (tipo?.[3] || /^BREAKING[ -]CHANGE:/m.test(mensagem)) nivel = Math.max(nivel, 3)
  else if (tipo?.[1] === 'feat') nivel = Math.max(nivel, 2)
  else if (tipo?.[1] === 'fix' || tipo?.[1] === 'perf') nivel = Math.max(nivel, 1)
}

if (nivel === 0) {
  console.error(
    `Nenhum feat, fix, perf ou breaking change desde ${ultimaTag}: não há o que lançar. ` +
      'Para lançar mesmo assim, informe a versão no campo do workflow.',
  )
  process.exit(1)
}

const [major, minor, patch] = semver.exec(ultimaTag.slice(1)).slice(1).map(Number)
if (nivel === 3 && major > 0) console.log(`${major + 1}.0.0`)
else if (nivel >= 2) console.log(`${major}.${minor + 1}.0`)
else console.log(`${major}.${minor}.${patch + 1}`)
