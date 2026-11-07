import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SCRIPT = resolve(__dirname, '../scripts/outdated-report.mjs')

/** Executa o script pela CLI, como o workflow faz, sem importar o .mjs (o tsconfig tem allowJs: false). */
function run(input: string) {
  const result = spawnSync('node', [SCRIPT], { encoding: 'utf8', input })
  return { code: result.status, stdout: result.stdout, stderr: result.stderr }
}

const pkg = (
  current: string,
  latest: string,
  dependencyType = 'dependencies',
  isDeprecated = false,
) => ({
  current,
  dependencyType,
  isDeprecated,
  latest,
  wanted: current,
})

describe('scripts/outdated-report.mjs', () => {
  it('não imprime nada quando não há pacote desatualizado', () => {
    expect(run('{}')).toMatchObject({ code: 0, stdout: '' })
    expect(run('')).toMatchObject({ code: 0, stdout: '' })
  })

  it('separa major, minor e patch, com major primeiro', () => {
    const { stdout } = run(
      JSON.stringify({
        jsdom: pkg('30.1.3', '31.0.0', 'devDependencies'),
        'lucide-react': pkg('1.66.0', '1.70.0'),
        vitest: pkg('5.0.5', '5.0.6', 'devDependencies'),
      }),
    )

    expect(stdout).toContain('3 pacote(s)')
    expect(stdout.indexOf('## Major')).toBeLessThan(stdout.indexOf('## Minor'))
    expect(stdout.indexOf('## Minor')).toBeLessThan(stdout.indexOf('## Patch'))
    expect(stdout).toContain('| `jsdom` | dev | 30.1.3 | 31.0.0 |')
    expect(stdout).toContain('| `lucide-react` | produção | 1.66.0 | 1.70.0 |')
  })

  it('ignora o major do typescript, mas não o minor', () => {
    const major = run(JSON.stringify({ typescript: pkg('6.0.3', '7.0.2', 'devDependencies') }))
    const minor = run(JSON.stringify({ typescript: pkg('6.0.3', '6.1.0', 'devDependencies') }))

    expect(major.stdout).toBe('')
    expect(minor.stdout).toContain('`typescript`')
  })

  it('marca pacote depreciado', () => {
    const { stdout } = run(JSON.stringify({ velho: pkg('1.0.0', '1.0.1', 'dependencies', true) }))

    expect(stdout).toContain('`velho` (depreciado)')
  })

  it('recusa entrada que não é JSON', () => {
    const { code, stderr } = run('não é json')

    expect(code).toBe(2)
    expect(stderr).toContain('não é JSON')
  })
})
