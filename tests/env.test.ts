import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

/** Linhas do `.env.example` que declaram variável, sem comentário nem linha em branco. */
function readDeclarations(): string[] {
  return readFileSync(resolve(root, '.env.example'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
}

describe('.env.example', () => {
  it('declara só nomes de variável, sem valor', () => {
    const declarations = readDeclarations()

    expect(declarations.length).toBeGreaterThan(0)
    for (const line of declarations) {
      expect(line, `"${line}" tem valor`).toMatch(/^[A-Z][A-Z0-9_]*=$/)
    }
  })

  it('não expõe chave secreta em variável NEXT_PUBLIC_', () => {
    const publicNames = readDeclarations()
      .map((line) => line.split('=')[0])
      .filter((name) => name.startsWith('NEXT_PUBLIC_'))

    expect(publicNames.length).toBeGreaterThan(0)
    for (const name of publicNames) {
      expect(name, `${name} iria para o navegador`).not.toMatch(/SECRET|SERVICE_ROLE/)
    }
  })
})

describe('arquivos versionados', () => {
  it('nenhum .env além do .env.example está no git', () => {
    const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
      .split('\n')
      .filter((file) => /(^|\/)\.env(\.|$)/.test(file) && file !== '.env.example')

    expect(tracked).toEqual([])
  })
})
