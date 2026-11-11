import type { Course, RatioUnit, RuleItem } from './rules.types'

const COURSES: Course[] = [
  {
    id: 'engenharia-de-computacao',
    name: 'Engenharia de Computação',
    degree: 'Bacharelado',
    campus: 'Fortaleza',
    targetHours: 120,
  },
]

// Dados do protótipo validado pela equipe. Conferir com as regras oficiais do curso antes da
// migração para o Supabase. A razão em campos (horas, a cada, unidade) foi tirada do texto da
// regra.
type ItemSeed = [
  itemNumber: number,
  name: string,
  rule: string,
  maxHours: number,
  hours: number,
  per: number,
  unit: RatioUnit,
]

const ENGINEERING_SEEDS: ItemSeed[] = [
  [
    1,
    'Programa de iniciação científica ou tecnológica',
    '40h a cada período letivo, até 80h',
    80,
    40,
    1,
    'periodo',
  ],
  [
    2,
    'Programa de iniciação à docência',
    '40h a cada período letivo, até 80h',
    80,
    40,
    1,
    'periodo',
  ],
  [3, 'Programa de monitoria', '40h por disciplina como monitor, até 80h', 80, 40, 1, 'disciplina'],
  [
    4,
    'Projeto de pesquisa ou extensão',
    '30h por projeto a cada período letivo, até 60h',
    60,
    30,
    1,
    'projeto',
  ],
  [
    5,
    'Atividades artístico-culturais ou esportivas',
    '1h a cada 2h de atividade, até 60h',
    60,
    1,
    2,
    'hora',
  ],
  [6, 'Curso de línguas', '1h a cada 4h de curso, até 60h', 60, 1, 4, 'hora'],
  [
    7,
    'Curso na área de engenharia de computação',
    '1h a cada 4h de curso, até 60h',
    60,
    1,
    4,
    'hora',
  ],
  [
    8,
    'Curso fora da área de engenharia de computação',
    '1h a cada 6h de curso, até 40h',
    40,
    1,
    6,
    'hora',
  ],
  [
    9,
    'Ministrar curso na área de engenharia de computação',
    '2h a cada 1h de curso, até 60h',
    60,
    2,
    1,
    'hora',
  ],
  [10, 'Certificação técnica', '30h por certificação, até 60h', 60, 30, 1, 'certificacao'],
  [
    11,
    'Organização de eventos técnicos ou científicos na área do curso',
    '20h por evento, até 40h',
    40,
    20,
    1,
    'evento',
  ],
  [
    12,
    'Participação em eventos técnicos ou científicos na área do curso',
    '4h por dia de evento, até 40h',
    40,
    4,
    1,
    'dia',
  ],
  [13, 'Ouvinte em palestras da área do curso', '2h por palestra, até 30h', 30, 2, 1, 'palestra'],
  [
    14,
    'Palestrante em palestras da área do curso',
    '8h por palestra, até 30h',
    30,
    8,
    1,
    'palestra',
  ],
  [15, 'Projeto social extracurricular', '15h por projeto, até 30h', 30, 15, 1, 'projeto'],
  [16, 'Produção técnica com relatório', '3h a cada 10 páginas, até 30h', 30, 3, 10, 'pagina'],
  [17, 'Pôster em evento nacional', '4h vezes o fator Qualis, até 30h', 30, 4, 1, 'fator_qualis'],
  [
    18,
    'Pôster em evento internacional',
    '5h vezes o fator Qualis, até 40h',
    40,
    5,
    1,
    'fator_qualis',
  ],
  [
    19,
    'Resumo publicado em evento nacional',
    '5h vezes o fator Qualis, até 40h',
    40,
    5,
    1,
    'fator_qualis',
  ],
  [
    20,
    'Resumo publicado em evento internacional',
    '6h vezes o fator Qualis, até 40h',
    40,
    6,
    1,
    'fator_qualis',
  ],
  [21, 'Artigo em evento nacional', '6h vezes o fator Qualis, até 80h', 80, 6, 1, 'fator_qualis'],
  [
    22,
    'Artigo em evento internacional',
    '7h vezes o fator Qualis, até 80h',
    80,
    7,
    1,
    'fator_qualis',
  ],
  [
    23,
    'Artigo em periódico nacional',
    '7h vezes o fator Qualis, até 80h',
    80,
    7,
    1,
    'fator_qualis',
  ],
  [
    24,
    'Artigo em periódico internacional',
    '8h vezes o fator Qualis, até 80h',
    80,
    8,
    1,
    'fator_qualis',
  ],
]

const ENGINEERING_ITEMS: RuleItem[] = ENGINEERING_SEEDS.map(
  ([itemNumber, name, rule, maxHours, hours, per, unit]) => ({
    itemNumber,
    name,
    rule,
    ratio: { hours, per, unit },
    maxHours,
  }),
)

const ITEMS_BY_COURSE: Record<string, RuleItem[]> = {
  'engenharia-de-computacao': ENGINEERING_ITEMS,
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** Cursos cujo nome contém o texto buscado, sem diferenciar acento nem caixa. Sem texto, todos. */
export function listCourses(search = ''): Course[] {
  const term = normalize(search)

  return structuredClone(COURSES.filter((course) => normalize(course.name).includes(term)))
}

/** Curso pelo id, ou `null` quando não existe. */
export function findCourse(id: string): Course | null {
  const course = COURSES.find((item) => item.id === id)

  return course ? structuredClone(course) : null
}

/** Itens do formulário do curso, na ordem do formulário. Curso desconhecido devolve lista vazia. */
export function listRuleItems(courseId: string): RuleItem[] {
  return structuredClone(ITEMS_BY_COURSE[courseId] ?? [])
}
