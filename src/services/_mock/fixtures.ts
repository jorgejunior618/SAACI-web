import type { AtividadeMock, ContaMock, MockDb } from './db'

// Só para testes. A aplicação começa vazia e é preenchida pelo que a pessoa cria nela.

// Dados de exemplo de design-system/docs/telas-e-fluxos.md.
export const CONTA_FIXTURE: ContaMock = {
  email: 'ana.moura07@aluno.ifce.edu.br',
  senha: 'saaci2026',
  nome: 'Ana Beatriz Moura',
  matricula: '2023104501',
  cursoId: 'eng-computacao-fortaleza',
  ingresso: '2023.2',
  isEmailConfirmado: true,
  linkEnviadoEm: '2026-10-01T10:00:00.000Z',
}

const MB = 1024 * 1024

const atividade = (
  id: string,
  itemNumero: number,
  nome: string,
  quantidade: number,
  dataFim: string,
  arquivo: string,
  tamanhoMb: number,
): AtividadeMock => ({
  id,
  itemNumero,
  nome,
  quantidade,
  dataFim,
  registradaEm: `${dataFim}T18:00:00.000Z`,
  comprovante: {
    nome: arquivo,
    tamanhoBytes: Math.round(tamanhoMb * MB),
    tipo: arquivo.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
    hasCopiaReduzida: false,
  },
})

const COM_ATIVIDADES: AtividadeMock[] = [
  atividade(
    'ingles',
    6,
    'Curso de inglês intermediário',
    60,
    '2025-06-30',
    'certificado-ingles-intermediario.pdf',
    0.9,
  ),
  atividade('git', 7, 'Curso de Git e GitHub', 32, '2025-05-03', 'certificado-git-github.pdf', 0.6),
  atividade(
    'python',
    7,
    'Curso de Python para análise de dados',
    40,
    '2025-11-14',
    'certificado-python-dados.pdf',
    0.8,
  ),
  atividade(
    'semana',
    12,
    'Semana de Engenharia de Computação 2025',
    3,
    '2025-09-19',
    'certificado-semana-ec-2025.pdf',
    1.1,
  ),
  atividade('hackathon', 12, 'Hackathon IFCE', 1, '2026-03-08', 'certificado-hackathon.pdf', 0.7),
  atividade(
    'quantica',
    13,
    'Palestra sobre computação quântica',
    1,
    '2025-03-12',
    'declaracao-palestra-quantica.jpg',
    0.5,
  ),
  atividade(
    'ia-embarcados',
    13,
    'Palestra sobre IA em sistemas embarcados',
    1,
    '2025-09-20',
    'declaracao-palestra-ia.jpg',
    0.6,
  ),
  atividade(
    'ciclo',
    13,
    'Ciclo de Palestras Tech IFCE',
    3,
    '2026-10-22',
    'certificado-ciclo-palestras.pdf',
    1.2,
  ),
  atividade(
    'boas-vindas',
    13,
    'Palestra de boas-vindas aos calouros',
    1,
    '2023-02-10',
    'certificado-boas-vindas.pdf',
    0.4,
  ),
]

const ITEM_NO_LIMITE: AtividadeMock[] = [
  ...COM_ATIVIDADES.filter((a) => a.itemNumero !== 13),
  atividade(
    'docker',
    7,
    'Curso de Docker e containers',
    72,
    '2026-02-20',
    'certificado-docker.pdf',
    0.8,
  ),
  atividade(
    'boas-vindas',
    13,
    'Palestra de boas-vindas aos calouros',
    1,
    '2023-02-10',
    'certificado-boas-vindas.pdf',
    0.4,
  ),
  atividade(
    'ciclo-2025',
    13,
    'Ciclo de Palestras Tech IFCE 2025',
    10,
    '2025-10-22',
    'certificado-ciclo-2025.pdf',
    1.2,
  ),
  atividade(
    'palestras-online',
    13,
    'Palestras online da SBC',
    4,
    '2026-04-15',
    'certificado-sbc-online.pdf',
    0.9,
  ),
  {
    ...atividade(
      'ciclo',
      13,
      'Ciclo de Palestras Tech IFCE',
      3,
      '2026-10-22',
      'certificado-ciclo-palestras.pdf',
      1.2,
    ),
    registradaEm: '2026-10-30T18:00:00.000Z',
  },
]

const COMPLETO: AtividadeMock[] = [
  atividade(
    'ic',
    1,
    'Iniciação científica em visão computacional',
    1,
    '2025-12-15',
    'declaracao-iniciacao-cientifica.pdf',
    0.7,
  ),
  atividade(
    'react',
    7,
    'Curso de React com TypeScript',
    80,
    '2025-08-12',
    'certificado-react-typescript.pdf',
    1.2,
  ),
  atividade(
    'python',
    7,
    'Curso de Python para análise de dados',
    80,
    '2025-11-14',
    'certificado-python-dados.pdf',
    0.8,
  ),
  atividade(
    'cloud',
    7,
    'Curso de computação em nuvem',
    80,
    '2026-05-30',
    'certificado-nuvem.pdf',
    0.9,
  ),
  atividade(
    'semana',
    12,
    'Semana de Engenharia de Computação 2025',
    3,
    '2025-09-19',
    'certificado-semana-ec-2025.pdf',
    1.1,
  ),
  atividade(
    'semana-2026',
    12,
    'Semana de Engenharia de Computação 2026',
    3,
    '2026-09-18',
    'certificado-semana-ec-2026.pdf',
    1.1,
  ),
]

export const FIXTURES = {
  'com-atividades': 'Com atividades (59h)',
  vazio: 'Primeiro acesso, sem atividades',
  'item-no-limite': 'Item 13 no limite',
  completo: 'Horas completas (124h)',
  'sem-curso': 'Conta nova, sem curso',
  'nao-confirmado': 'E-mail não confirmado',
  'sem-sessao': 'Sem sessão',
} as const

export type Fixture = keyof typeof FIXTURES

export function criarFixture(fixture: Fixture): MockDb {
  const base: MockDb = {
    versao: 2,
    conta: { ...CONTA_FIXTURE },
    hasSessao: true,
    atividades: structuredClone(COM_ATIVIDADES),
    shouldFalharProximoDownload: false,
  }

  switch (fixture) {
    case 'com-atividades':
      return base
    case 'vazio':
      return { ...base, atividades: [] }
    case 'item-no-limite':
      return { ...base, atividades: structuredClone(ITEM_NO_LIMITE) }
    case 'completo':
      return { ...base, atividades: structuredClone(COMPLETO) }
    case 'sem-curso':
      return {
        ...base,
        conta: { ...CONTA_FIXTURE, nome: null, matricula: null, cursoId: null, ingresso: null },
        atividades: [],
      }
    case 'nao-confirmado':
      return {
        ...base,
        conta: {
          ...CONTA_FIXTURE,
          nome: null,
          matricula: null,
          cursoId: null,
          ingresso: null,
          isEmailConfirmado: false,
          linkEnviadoEm: new Date().toISOString(),
        },
        atividades: [],
      }
    case 'sem-sessao':
      return { ...base, hasSessao: false }
  }
}
