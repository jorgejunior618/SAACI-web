import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { PROOF_MAX_BYTES, PROOF_MIME_TYPES } from '@/services/activities/activities.types'

const root = resolve(import.meta.dirname, '..')

/** Caminhos dos arquivos `.ts` e `.tsx` de uma pasta, sem entrar em `node_modules`. */
function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name)

    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : listSourceFiles(path)

    return /\.tsx?$/.test(entry.name) ? [path] : []
  })
}

/** Texto das migrations que mexem no bucket de comprovantes, na ordem em que rodam. */
function readBucketMigrations(): string[] {
  const dir = resolve(root, 'supabase/migrations')

  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => readFileSync(resolve(dir, name), 'utf8'))
    .filter((sql) => sql.includes("'comprovantes'"))
}

describe('bucket de comprovantes', () => {
  it('tem o mesmo limite de tamanho do front (RF31)', () => {
    const migrations = readBucketMigrations()

    expect(migrations.length).toBeGreaterThan(0)
    expect(migrations.at(-1)).toContain(String(PROOF_MAX_BYTES))
  })

  it('aceita exatamente os mesmos tipos de arquivo do front (RNF25)', () => {
    const migrations = readBucketMigrations()
    const match = migrations.at(-1)?.match(/array\[([^\]]+)\]/)

    expect(match).not.toBeNull()
    const types = [...(match?.[1].matchAll(/'([^']+)'/g) ?? [])].map((m) => m[1])

    expect(types.toSorted()).toEqual([...PROOF_MIME_TYPES].toSorted())
  })

  it('é privado, nunca público (RNF04)', () => {
    const migrations = readBucketMigrations()

    expect(migrations.length).toBeGreaterThan(0)
    expect(migrations.at(-1)).toMatch(/'comprovantes',\s*'comprovantes',\s*false,/)
  })

  it('nenhum arquivo de src/ pede URL pública', () => {
    const files = listSourceFiles(resolve(root, 'src'))
    const offenders = files.filter((file) => readFileSync(file, 'utf8').includes('getPublicUrl'))

    expect(files.length).toBeGreaterThan(0)
    expect(offenders).toEqual([])
  })
})
