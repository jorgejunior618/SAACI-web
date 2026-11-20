import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RuleItem } from '../rules/rules.types'
import { getActivities, getActivity, getProofFile, getProofUrl, readProof } from './activities.api'
import {
  ActivityNotFoundError,
  InvalidActivityDatesError,
  InvalidActivityItemError,
  ProofDownloadError,
  StaleActivityError,
  UnreadableProofError,
} from './activities.errors'
import { createActivity, removeActivity, updateActivity } from './activities.mutations'
import { PROOF_MIME_TYPES, toProofType } from './activities.types'

const USER_ID = '00000000-0000-4000-8000-0000000000a1'
const ID_1 = '00000000-0000-4000-8000-000000000001'
const ID_2 = '00000000-0000-4000-8000-000000000002'
const NEW_ID = '00000000-0000-4000-8000-000000000099'

// Mensagem do Postgres para o item fora da matriz do curso (FK composta da migration `atividades`).
const ITEM_FK_MESSAGE =
  'insert or update on table "atividades" violates foreign key constraint "atividades_curso_id_item_numero_fkey"'

// Os itens que os testes usam, com a razão e o máximo da migration `regras_dos_cursos`.
const rules = vi.hoisted(() => ({
  items: [
    {
      itemNumber: 7,
      name: 'Curso na área de engenharia de computação',
      rule: '1h a cada 4h de curso, até 60h',
      ratio: { hours: 1, per: 4, unit: 'hora' },
      maxHours: 60,
    },
    {
      itemNumber: 13,
      name: 'Ouvinte em palestras da área do curso',
      rule: '2h por palestra, até 30h',
      ratio: { hours: 2, per: 1, unit: 'palestra' },
      maxHours: 30,
    },
  ] satisfies RuleItem[],
}))

vi.mock('../rules/rules.api', () => ({ getRuleItems: () => Promise.resolve(rules.items) }))
vi.mock('../profile/profile.api', () => ({
  getProfile: () =>
    Promise.resolve({
      name: 'Ana Beatriz Moura',
      enrollmentId: null,
      startSemester: '2023-07-01',
      courseId: '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11',
    }),
}))

type DbResponse = { data: unknown; error: unknown }

// Cliente falso do Supabase. Cada consulta anota as chamadas e, no `await`, entrega a próxima
// resposta da fila `responses`, na ordem em que o service espera.
const db = vi.hoisted(() => {
  const state = {
    responses: [] as DbResponse[],
    calls: [] as unknown[][],
  }

  class FakeQuery implements PromiseLike<DbResponse> {
    constructor(private readonly table: string) {}

    private record(method: string, args: unknown[]): this {
      state.calls.push([`${this.table}.${method}`, ...args])
      return this
    }

    select(...args: unknown[]): this {
      return this.record('select', args)
    }
    order(...args: unknown[]): this {
      return this.record('order', args)
    }
    eq(...args: unknown[]): this {
      return this.record('eq', args)
    }
    update(...args: unknown[]): this {
      return this.record('update', args)
    }
    delete(...args: unknown[]): this {
      return this.record('delete', args)
    }
    maybeSingle(): this {
      return this.record('maybeSingle', [])
    }
    abortSignal(...args: unknown[]): this {
      return this.record('abortSignal', args)
    }

    then<T1 = DbResponse, T2 = never>(
      onFulfilled?: ((value: DbResponse) => T1 | PromiseLike<T1>) | null,
      onRejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
    ): PromiseLike<T1 | T2> {
      const next = state.responses.shift() ?? { data: null, error: new Error('fila vazia') }

      return Promise.resolve(next).then(onFulfilled, onRejected)
    }
  }

  const storage = {
    upload: vi.fn(),
    remove: vi.fn(),
    createSignedUrl: vi.fn(),
    download: vi.fn(),
  }
  // A RPC de registro encadeia `.single()`; o teste define a resposta em `rpcSingle`.
  const rpcSingle = vi.fn()
  const client = {
    from: (table: string) => new FakeQuery(table),
    rpc: vi.fn(() => ({ single: rpcSingle })),
    auth: { getUser: vi.fn() },
    storage: { from: vi.fn(() => storage) },
  }

  return { state, storage, client, rpcSingle }
})

vi.mock('@supabase/client', () => ({ createClient: () => db.client }))

function row(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    nome: 'Curso de Git e GitHub',
    item_numero: 7,
    quantidade: 32,
    data_inicio: '2025-04-07',
    data_fim: '2025-05-03',
    created_at: '2025-05-03T12:00:00.123456+00:00',
    updated_at: '2025-05-03T12:00:00.123456+00:00',
    comprovante_nome: 'certificado-git.pdf',
    comprovante_tamanho: 701000,
    comprovante_tipo: 'application/pdf',
    ...overrides,
  }
}

const ROWS = [
  row(ID_1),
  // Começou antes do ingresso (2023.2): não conta (RF38).
  row(ID_2, {
    nome: 'Palestra de boas-vindas aos calouros',
    item_numero: 13,
    quantidade: 1,
    data_inicio: '2023-02-10',
    data_fim: '2023-02-10',
    comprovante_tipo: 'image/png',
  }),
]

function queue(...responses: DbResponse[]): void {
  db.state.responses.push(...responses)
}

function ok(data: unknown): DbResponse {
  return { data, error: null }
}

function pdf(name = 'certificado.pdf'): File {
  return new File(['conteudo'], name, { type: 'application/pdf' })
}

const NEW_ACTIVITY = {
  name: 'Curso de React com TypeScript',
  itemNumber: 7,
  quantity: 40,
  startDate: '2026-08-03',
  endDate: '2026-09-12',
}

beforeEach(() => {
  vi.clearAllMocks()
  db.state.responses = []
  db.state.calls = []
  db.client.auth.getUser.mockResolvedValue({ data: { user: { id: USER_ID } }, error: null })
  db.storage.upload.mockResolvedValue({ data: { path: 'x' }, error: null })
  db.storage.remove.mockResolvedValue({ data: [], error: null })
})

describe('getActivities', () => {
  it('traduz as linhas e calcula as horas de cada atividade pela regra do item', async () => {
    queue(ok(ROWS))

    const list = await getActivities()

    expect(list).toHaveLength(2)
    expect(list[0]).toMatchObject({
      id: ID_1,
      name: 'Curso de Git e GitHub',
      itemNumber: 7,
      quantity: 32,
      registeredAt: '2025-05-03T12:00:00.123456+00:00',
      countedHours: 8,
      status: 'conta',
      proof: { fileName: 'certificado-git.pdf', sizeBytes: 701000, type: 'pdf' },
    })
    expect(list[1]).toMatchObject({
      countedHours: 0,
      status: 'nao_conta',
      reason: 'antes_do_ingresso',
      proof: { type: 'png' },
    })
  })

  it('pede ao banco a ordem da lista: item, data de fim e registro', async () => {
    queue(ok(ROWS))

    await getActivities()

    expect(db.state.calls.filter(([call]) => call === 'atividades.order')).toEqual([
      ['atividades.order', 'item_numero'],
      ['atividades.order', 'data_fim'],
      ['atividades.order', 'created_at'],
    ])
  })

  it('repassa o erro do banco sem traduzir', async () => {
    const failure = new Error('falha de rede')

    queue({ data: null, error: failure })

    await expect(getActivities()).rejects.toBe(failure)
  })

  it('recusa linha com tipo de comprovante fora da lista', async () => {
    queue(ok([row(ID_1, { comprovante_tipo: 'image/gif' })]))

    await expect(getActivities()).rejects.toThrow()
  })
})

describe('getActivity', () => {
  it('devolve a atividade do id e null para id que não existe', async () => {
    queue(ok(ROWS), ok(ROWS))

    expect(await getActivity(ID_2)).toMatchObject({ id: ID_2 })
    expect(await getActivity(NEW_ID)).toBeNull()
  })

  it('devolve null para id que não é uuid, sem perguntar ao banco', async () => {
    expect(await getActivity('nao-e-uuid')).toBeNull()
    expect(db.state.calls).toEqual([])
  })
})

describe('createActivity', () => {
  // A linha que a RPC devolve: o que o banco decidiu (id, datas de controle, tamanho e tipo).
  const REGISTERED = {
    id: NEW_ID,
    created_at: '2026-11-19T12:00:00.123456+00:00',
    updated_at: '2026-11-19T12:00:00.123456+00:00',
    comprovante_tamanho: 8,
    comprovante_tipo: 'application/pdf',
  }

  it('usa o tipo curto do comprovante como extensão do arquivo no bucket', async () => {
    queue(ok(ROWS))
    db.rpcSingle.mockResolvedValue(
      ok({ ...REGISTERED, comprovante_tipo: 'image/png', comprovante_tamanho: 3 }),
    )

    const created = await createActivity({
      ...NEW_ACTIVITY,
      proof: new File(['png'], 'foto.png', { type: 'image/png' }),
    })

    expect(db.storage.upload.mock.calls[0]?.[0]).toMatch(/\.png$/)
    expect(created.proof.type).toBe('png')
  })

  it('sobe o arquivo na pasta do aluno e registra pela RPC com o hash do arquivo', async () => {
    // Leitura antes do upload: a lista atual. Depois da RPC, nenhuma consulta mais.
    queue(ok(ROWS))
    db.rpcSingle.mockResolvedValue(ok(REGISTERED))

    const created = await createActivity({ ...NEW_ACTIVITY, proof: pdf() })

    const [path, file, options] = db.storage.upload.mock.calls[0] ?? []

    expect(path).toMatch(new RegExp(`^${USER_ID}/[0-9a-f-]{36}\\.pdf$`))
    expect(file).toBeInstanceOf(File)
    expect(options).toEqual({ contentType: 'application/pdf', upsert: false })
    expect(db.client.rpc).toHaveBeenCalledWith('registrar_atividade', {
      nome: NEW_ACTIVITY.name,
      item_numero: 7,
      quantidade: 40,
      data_inicio: '2026-08-03',
      data_fim: '2026-09-12',
      comprovante_caminho: path,
      comprovante_nome: 'certificado.pdf',
      comprovante_hash: createHash('sha256').update('conteudo').digest('hex'),
    })
    expect(created).toMatchObject({
      id: NEW_ID,
      name: NEW_ACTIVITY.name,
      registeredAt: REGISTERED.created_at,
      updatedAt: REGISTERED.updated_at,
      countedHours: 10,
      status: 'conta',
      proof: { fileName: 'certificado.pdf', sizeBytes: 8, type: 'pdf' },
    })
  })

  it('calcula as horas da nova junto com as que já existem (máximo do item, RF16)', async () => {
    // Item 7 vai até 60h. A lista já tem 55h nele (220h de curso); a nova (40h → 10h) só cabe 5h.
    queue(ok([row(ID_1, { quantidade: 220 })]))
    db.rpcSingle.mockResolvedValue(ok(REGISTERED))

    const created = await createActivity({ ...NEW_ACTIVITY, proof: pdf() })

    expect(created).toMatchObject({ countedHours: 5, status: 'parcial', reason: 'item_cheio' })
  })

  it('depois que a RPC grava, não vai mais à rede: a falha não vira "não registrada"', async () => {
    queue(ok(ROWS))
    db.rpcSingle.mockResolvedValue(ok(REGISTERED))

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).resolves.toMatchObject({
      id: NEW_ID,
    })
    // A única consulta de tabela foi a leitura de antes do upload.
    expect(db.state.calls.filter(([call]) => call === 'atividades.select')).toHaveLength(1)
    expect(db.state.responses).toEqual([])
  })

  it('não sobe nada quando a leitura de antes falha', async () => {
    const failure = new Error('falha de rede')

    queue({ data: null, error: failure })

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).rejects.toBe(failure)
    expect(db.storage.upload).not.toHaveBeenCalled()
    expect(db.client.rpc).not.toHaveBeenCalled()
  })

  it('apaga o arquivo enviado quando o banco recusa e repassa o erro', async () => {
    const failure = { code: 'SA024', message: 'O comprovante não foi enviado.' }

    queue(ok(ROWS))
    db.rpcSingle.mockResolvedValue({ data: null, error: failure })

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).rejects.toBe(failure)
    expect(db.storage.remove).toHaveBeenCalledWith([db.storage.upload.mock.calls[0]?.[0]])
  })

  it('mantém o arquivo quando a RPC falha sem código (rede): a atividade pode ter sido gravada', async () => {
    // Formato do erro do postgrest-js quando o `fetch` falha: sem SQLSTATE.
    const failure = { code: '', message: 'TypeError: fetch failed', details: '', hint: '' }

    queue(ok(ROWS))
    db.rpcSingle.mockResolvedValue({ data: null, error: failure })

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).rejects.toBe(failure)
    expect(db.storage.remove).not.toHaveBeenCalled()
  })

  it('traduz o check de datas do banco', async () => {
    queue(ok(ROWS))
    db.rpcSingle.mockResolvedValue({
      data: null,
      error: {
        code: '23514',
        message: 'new row violates check constraint "atividades_datas_check"',
      },
    })

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).rejects.toBeInstanceOf(
      InvalidActivityDatesError,
    )
  })

  it('traduz o item fora da matriz do curso e apaga o arquivo', async () => {
    queue(ok(ROWS))
    db.rpcSingle.mockResolvedValue({
      data: null,
      error: { code: '23503', message: ITEM_FK_MESSAGE },
    })

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).rejects.toBeInstanceOf(
      InvalidActivityItemError,
    )
    expect(db.storage.remove).toHaveBeenCalled()
  })

  it('não chama a RPC quando o upload falha', async () => {
    const failure = new Error('upload recusado')

    queue(ok(ROWS))
    db.storage.upload.mockResolvedValue({ data: null, error: failure })

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).rejects.toBe(failure)
    expect(db.client.rpc).not.toHaveBeenCalled()
  })

  it('não sobe nada sem sessão', async () => {
    db.client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(createActivity({ ...NEW_ACTIVITY, proof: pdf() })).rejects.toThrow('Entre de novo')
    expect(db.storage.upload).not.toHaveBeenCalled()
  })

  it('recusa comprovante de tipo não aceito e fim antes do início, antes de subir', async () => {
    await expect(
      createActivity({
        ...NEW_ACTIVITY,
        proof: new File(['x'], 'foto.gif', { type: 'image/gif' }),
      }),
    ).rejects.toThrow()
    await expect(
      createActivity({ ...NEW_ACTIVITY, endDate: '2026-08-01', proof: pdf() }),
    ).rejects.toThrow()
    expect(db.storage.upload).not.toHaveBeenCalled()
  })
})

describe('updateActivity', () => {
  const READ_AT = '2025-05-03T12:00:00.123456+00:00'

  // A linha que o `update` devolve: a corrigida, com o `updated_at` novo do gatilho.
  const CORRECTED = row(ID_1, {
    nome: 'Novo nome',
    quantidade: 80,
    updated_at: '2026-11-19T12:00:00.654321+00:00',
  })

  it('grava só os campos enviados, presa ao updated_at lido', async () => {
    // Leitura antes do `update`: a lista atual. Depois, a linha corrigida que o `update` devolve.
    queue(ok(ROWS), ok(CORRECTED))

    const corrected = await updateActivity(ID_1, READ_AT, { name: 'Novo nome', quantity: 80 })

    expect(db.state.calls).toContainEqual([
      'atividades.update',
      { nome: 'Novo nome', quantidade: 80 },
    ])
    expect(db.state.calls).toContainEqual(['atividades.eq', 'id', ID_1])
    expect(db.state.calls).toContainEqual(['atividades.eq', 'updated_at', READ_AT])
    expect(corrected).toMatchObject({
      id: ID_1,
      name: 'Novo nome',
      updatedAt: CORRECTED.updated_at,
      countedHours: 20,
    })
  })

  it('não vai à rede depois de gravar: a leitura acontece antes do update', async () => {
    queue(ok(ROWS), ok(CORRECTED))

    await updateActivity(ID_1, READ_AT, { name: 'Novo nome', quantity: 80 })

    const methods = db.state.calls.map(([method]) => method)
    const updateAt = methods.indexOf('atividades.update')

    expect(updateAt).toBeGreaterThan(methods.lastIndexOf('atividades.order'))
    // Depois do `update`, só o encadeamento dele: nenhuma consulta nova.
    expect(methods.slice(updateAt)).toEqual([
      'atividades.update',
      'atividades.eq',
      'atividades.eq',
      'atividades.select',
      'atividades.maybeSingle',
    ])
  })

  it('falha na leitura antes do update não grava nada', async () => {
    const failure = new Error('rede caiu')

    queue({ data: null, error: failure })

    await expect(updateActivity(ID_1, READ_AT, { name: 'Outro' })).rejects.toBe(failure)
    expect(db.state.calls.map(([method]) => method)).not.toContain('atividades.update')
  })

  it('zero linhas com a atividade ainda lá é conflito', async () => {
    queue(ok(ROWS), ok(null), ok({ id: ID_1 }))

    await expect(updateActivity(ID_1, READ_AT, { name: 'Outro' })).rejects.toBeInstanceOf(
      StaleActivityError,
    )
  })

  it('zero linhas sem a atividade é não encontrada', async () => {
    queue(ok(ROWS), ok(null), ok(null))

    await expect(updateActivity(ID_1, READ_AT, { name: 'Outro' })).rejects.toBeInstanceOf(
      ActivityNotFoundError,
    )
  })

  it('traduz o check de datas quando só uma das datas foi corrigida', async () => {
    queue(ok(ROWS), {
      data: null,
      error: {
        code: '23514',
        message:
          'new row for relation "atividades" violates check constraint "atividades_datas_check"',
      },
    })

    await expect(updateActivity(ID_1, READ_AT, { endDate: '2020-01-01' })).rejects.toBeInstanceOf(
      InvalidActivityDatesError,
    )
  })

  it('repassa outro check sem traduzir', async () => {
    const failure = { code: '23514', message: 'violates check constraint "atividades_nome_check"' }

    queue(ok(ROWS), { data: null, error: failure })

    await expect(updateActivity(ID_1, READ_AT, { name: 'x' })).rejects.toBe(failure)
  })

  it('traduz o item que não existe nas regras do curso', async () => {
    queue(ok(ROWS), { data: null, error: { code: '23503', message: ITEM_FK_MESSAGE } })

    await expect(updateActivity(ID_1, READ_AT, { itemNumber: 99 })).rejects.toBeInstanceOf(
      InvalidActivityItemError,
    )
  })

  it('repassa outra FK sem traduzir', async () => {
    const failure = {
      code: '23503',
      message: 'violates foreign key constraint "atividades_aluno_id_fkey"',
    }

    queue(ok(ROWS), { data: null, error: failure })

    await expect(updateActivity(ID_1, READ_AT, { name: 'x' })).rejects.toBe(failure)
  })
})

describe('removeActivity', () => {
  it('apaga a linha e depois o arquivo dela', async () => {
    queue(ok({ comprovante_caminho: `${USER_ID}/a.pdf` }))

    await removeActivity(ID_1)

    expect(db.state.calls).toContainEqual(['atividades.delete'])
    expect(db.storage.remove).toHaveBeenCalledWith([`${USER_ID}/a.pdf`])
  })

  it('não lança quando só o arquivo falha: a atividade já saiu', async () => {
    queue(ok({ comprovante_caminho: `${USER_ID}/a.pdf` }))
    db.storage.remove.mockResolvedValue({ data: null, error: new Error('storage fora') })

    await expect(removeActivity(ID_1)).resolves.toBeUndefined()
  })

  it('atividade que não existe não apaga arquivo nenhum', async () => {
    queue(ok(null))

    await expect(removeActivity(ID_1)).rejects.toBeInstanceOf(ActivityNotFoundError)
    expect(db.storage.remove).not.toHaveBeenCalled()
  })
})

describe('comprovante', () => {
  it('getProofUrl pede URL assinada de 60 segundos do caminho da atividade', async () => {
    queue(ok({ comprovante_caminho: `${USER_ID}/a.pdf` }))
    db.storage.createSignedUrl.mockResolvedValue({
      data: {
        signedUrl: 'http://127.0.0.1:54321/storage/v1/object/sign/comprovantes/a.pdf?token=t',
      },
      error: null,
    })

    expect(await getProofUrl(ID_1)).toContain('token=t')
    expect(db.storage.createSignedUrl).toHaveBeenCalledWith(`${USER_ID}/a.pdf`, 60)
  })

  it('getProofUrl de atividade que não existe', async () => {
    queue(ok(null))

    await expect(getProofUrl(ID_1)).rejects.toBeInstanceOf(ActivityNotFoundError)
  })

  it('getProofFile devolve o arquivo baixado', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' })

    queue(ok({ comprovante_caminho: `${USER_ID}/a.pdf` }))
    db.storage.download.mockResolvedValue({ data: blob, error: null })

    expect(await getProofFile(ID_1)).toBe(blob)
  })

  it('getProofFile traduz a falha do Storage', async () => {
    queue(ok({ comprovante_caminho: `${USER_ID}/a.pdf` }))
    db.storage.download.mockResolvedValue({ data: null, error: new Error('rede') })

    await expect(getProofFile(ID_1)).rejects.toBeInstanceOf(ProofDownloadError)
  })

  it('getProofFile para quando o download é cancelado', async () => {
    const controller = new AbortController()

    controller.abort()

    await expect(getProofFile(ID_1, controller.signal)).rejects.toThrow()
    expect(db.storage.download).not.toHaveBeenCalled()
  })

  it('getProofFile passa o cancelamento também à leitura do caminho', async () => {
    const controller = new AbortController()

    queue(ok({ comprovante_caminho: `${USER_ID}/a.pdf` }))
    db.storage.download.mockResolvedValue({ data: new Blob(['%PDF']), error: null })

    await getProofFile(ID_1, controller.signal)

    expect(db.state.calls).toContainEqual(['atividades.abortSignal', controller.signal])
  })

  it('getProofFile traduz a falha de rede ao ler o caminho, sem baixar nada', async () => {
    // Formato do erro do postgrest-js quando o `fetch` falha: sem código.
    queue({ data: null, error: { code: '', message: 'TypeError: fetch failed' } })

    await expect(getProofFile(ID_1)).rejects.toBeInstanceOf(ProofDownloadError)
    expect(db.storage.download).not.toHaveBeenCalled()
  })

  it('getProofFile repassa a recusa do banco ao ler o caminho', async () => {
    const failure = { code: 'PGRST301', message: 'JWT expired' }

    queue({ data: null, error: failure })

    await expect(getProofFile(ID_1)).rejects.toBe(failure)
  })

  it('getProofFile de atividade que não existe continua sendo não encontrada', async () => {
    queue(ok(null))

    await expect(getProofFile(ID_1)).rejects.toBeInstanceOf(ActivityNotFoundError)
  })

  it('readProof cobre os três caminhos da leitura fingida', async () => {
    expect(await readProof(pdf())).toMatchObject({ itemNumber: 7, quantity: 40 })
    expect(await readProof(pdf('sem-item.pdf'))).toMatchObject({ itemNumber: null })
    await expect(readProof(pdf('ilegivel.pdf'))).rejects.toBeInstanceOf(UnreadableProofError)
  })
})

describe('toProofType', () => {
  it('traduz cada tipo aceito para o tipo curto, que é também a extensão', () => {
    expect(PROOF_MIME_TYPES.map(toProofType)).toEqual(['pdf', 'jpg', 'png'])
  })

  it('recusa tipo fora da lista em vez de cair num padrão', () => {
    expect(() => toProofType('image/webp')).toThrow('image/webp')
  })
})
