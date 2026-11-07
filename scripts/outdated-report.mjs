// Transforma a saída de `pnpm outdated --format json` em um relatório Markdown para uma issue.
//   pnpm outdated --format json | node scripts/outdated-report.mjs
// Sem pacote para atualizar, não imprime nada: o workflow lê isso como "feche a issue".
//
// O pnpm sai com código 1 quando há pacote desatualizado. Quem chama deve tolerar isso.

// Major que o time decidiu não acompanhar ainda (o typescript-eslint não suporta o TypeScript 7,
// ver doc/tecnologia.md). Sai do relatório até a restrição acabar.
const IGNORED_MAJORS = new Set(['typescript'])

const TYPE_ORDER = ['major', 'minor', 'patch', 'other']

const TYPE_TITLES = {
  major: 'Major (pode quebrar, leia o changelog antes)',
  minor: 'Minor',
  patch: 'Patch',
  other: 'Outras (versão fora do padrão)',
}

/** Compara as versões e diz qual parte mudou. Versão fora de `x.y.z` vira `other`. */
function classify(current, latest) {
  const parse = (version) => version.split('.').map((part) => Number.parseInt(part, 10))
  const [a, b] = [parse(current), parse(latest)]

  if ([...a, ...b].some(Number.isNaN) || a.length < 3 || b.length < 3) return 'other'
  if (a[0] !== b[0]) return 'major'
  if (a[1] !== b[1]) return 'minor'
  return 'patch'
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolve(data))
    process.stdin.on('error', reject)
  })
}

const raw = (await readStdin()).trim()
let outdated = {}

if (raw) {
  try {
    outdated = JSON.parse(raw)
  } catch {
    console.error(
      'A entrada não é JSON. Use: pnpm outdated --format json | node scripts/outdated-report.mjs',
    )
    process.exit(2)
  }
}

const entries = Object.entries(outdated)
  .filter(([, info]) => info.latest && info.current !== info.latest)
  .map(([name, info]) => ({
    name,
    current: info.current,
    latest: info.latest,
    isDev: info.dependencyType === 'devDependencies',
    isDeprecated: info.isDeprecated === true,
    type: classify(info.current, info.latest),
  }))
  .filter((entry) => !(entry.type === 'major' && IGNORED_MAJORS.has(entry.name)))
  .sort((x, y) => x.name.localeCompare(y.name))

if (entries.length === 0) process.exit(0)

const lines = [
  `${entries.length} pacote(s) com versão nova. Atualize quando fizer sentido; nenhum PR foi aberto.`,
  '',
]

for (const type of TYPE_ORDER) {
  const group = entries.filter((entry) => entry.type === type)
  if (group.length === 0) continue

  lines.push(
    `## ${TYPE_TITLES[type]}`,
    '',
    '| Pacote | Uso | Atual | Mais recente |',
    '| --- | --- | --- | --- |',
  )
  for (const entry of group) {
    const note = entry.isDeprecated ? ' (depreciado)' : ''
    lines.push(
      `| \`${entry.name}\`${note} | ${entry.isDev ? 'dev' : 'produção'} | ${entry.current} | ${entry.latest} |`,
    )
  }
  lines.push('')
}

lines.push(
  '## Como atualizar',
  '',
  '1. Crie uma branch e rode `pnpm up --latest <pacote>` (ou `pnpm up --latest` para todos de uma vez).',
  '2. Rode `pnpm lint`, `pnpm typecheck` e `pnpm test`.',
  '3. Abra o PR. A issue se atualiza sozinha na próxima execução semanal.',
  '',
)

process.stdout.write(`${lines.join('\n')}\n`)
