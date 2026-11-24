// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { DbClient } from '@supabase/client'
import { describe, expect, it, vi } from 'vitest'

import { getProgress } from './progress.api'

// A conta mora no banco (função `progresso_do_aluno`) e é testada pelo pgTAP e pela paridade com o
// TypeScript. Aqui fica só o service: a tradução dos nomes, o `v.parse` e o tratamento do erro.
const SQL_PROGRESS = {
  total_horas: 59,
  meta_horas: 120,
  faltam_horas: 61,
  soma_itens: 59.4,
  itens: [
    {
      numero: 6,
      nome: 'Curso de línguas',
      horas_contadas: 15,
      maximo_horas: 60,
      horas_excedentes: 0,
    },
    {
      numero: 13,
      nome: 'Ouvinte em palestras da área do curso',
      horas_contadas: 30,
      maximo_horas: 30,
      horas_excedentes: 4,
    },
  ],
}

function dbWith(result: { data: unknown; error: unknown }): { db: DbClient; rpc: typeof rpc } {
  const rpc = vi.fn(() => Promise.resolve(result))

  return { db: { rpc } as unknown as DbClient, rpc }
}

describe('getProgress', () => {
  it('traduz a resposta do banco para o progresso, com uma ida só', async () => {
    const { db, rpc } = dbWith({ data: SQL_PROGRESS, error: null })

    expect(await getProgress(db)).toEqual({
      totalHours: 59,
      targetHours: 120,
      missingHours: 61,
      itemsSum: 59.4,
      categories: [
        {
          itemNumber: 6,
          name: 'Curso de línguas',
          countedHours: 15,
          maxHours: 60,
          hoursOverLimit: 0,
        },
        {
          itemNumber: 13,
          name: 'Ouvinte em palestras da área do curso',
          countedHours: 30,
          maxHours: 30,
          hoursOverLimit: 4,
        },
      ],
    })
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('progresso_do_aluno')
  })

  it('aceita o aluno sem nenhum item com horas', async () => {
    const { db } = dbWith({
      data: { ...SQL_PROGRESS, total_horas: 0, faltam_horas: 120, soma_itens: 0, itens: [] },
      error: null,
    })

    expect(await getProgress(db)).toMatchObject({
      totalHours: 0,
      missingHours: 120,
      categories: [],
    })
  })

  it('lança, com o que fazer a seguir, quando o perfil ainda não tem curso', async () => {
    const { db } = dbWith({ data: null, error: null })

    await expect(getProgress(db)).rejects.toThrow('Escolha o curso em Seu curso.')
  })

  it('repassa o erro do banco sem traduzir', async () => {
    const failure = { code: '42501', message: 'permission denied' }
    const { db } = dbWith({ data: null, error: failure })

    await expect(getProgress(db)).rejects.toBe(failure)
  })

  it('recusa total com casa decimal, que o banco nunca deveria mandar (RF14)', async () => {
    const { db } = dbWith({ data: { ...SQL_PROGRESS, total_horas: 59.4 }, error: null })

    await expect(getProgress(db)).rejects.toThrow()
  })

  it('recusa resposta fora do formato esperado', async () => {
    const { db } = dbWith({ data: { ...SQL_PROGRESS, itens: 'nenhum' }, error: null })

    await expect(getProgress(db)).rejects.toThrow()
  })
})
