import type { Course, RuleItem } from './rules.types'

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
// migração para o Supabase (`doc/modelagem-dados.md`, "Regras de cálculo são dado").
const ENGINEERING_ITEMS: RuleItem[] = [
  [1, 'Programa de iniciação científica ou tecnológica', '40h a cada período letivo, até 80h', 80],
  [2, 'Programa de iniciação à docência', '40h a cada período letivo, até 80h', 80],
  [3, 'Programa de monitoria', '40h por disciplina como monitor, até 80h', 80],
  [4, 'Projeto de pesquisa ou extensão', '30h por projeto a cada período letivo, até 60h', 60],
  [5, 'Atividades artístico-culturais ou esportivas', '1h a cada 2h de atividade, até 60h', 60],
  [6, 'Curso de línguas', '1h a cada 4h de curso, até 60h', 60],
  [7, 'Curso na área de engenharia de computação', '1h a cada 4h de curso, até 60h', 60],
  [8, 'Curso fora da área de engenharia de computação', '1h a cada 6h de curso, até 40h', 40],
  [9, 'Ministrar curso na área de engenharia de computação', '2h a cada 1h de curso, até 60h', 60],
  [10, 'Certificação técnica', '30h por certificação, até 60h', 60],
  [
    11,
    'Organização de eventos técnicos ou científicos na área do curso',
    '20h por evento, até 40h',
    40,
  ],
  [
    12,
    'Participação em eventos técnicos ou científicos na área do curso',
    '4h por dia de evento, até 40h',
    40,
  ],
  [13, 'Ouvinte em palestras da área do curso', '2h por palestra, até 30h', 30],
  [14, 'Palestrante em palestras da área do curso', '8h por palestra, até 30h', 30],
  [15, 'Projeto social extracurricular', '15h por projeto, até 30h', 30],
  [16, 'Produção técnica com relatório', '3h a cada 10 páginas, até 30h', 30],
  [17, 'Pôster em evento nacional', '4h vezes o fator Qualis, até 30h', 30],
  [18, 'Pôster em evento internacional', '5h vezes o fator Qualis, até 40h', 40],
  [19, 'Resumo publicado em evento nacional', '5h vezes o fator Qualis, até 40h', 40],
  [20, 'Resumo publicado em evento internacional', '6h vezes o fator Qualis, até 40h', 40],
  [21, 'Artigo em evento nacional', '6h vezes o fator Qualis, até 80h', 80],
  [22, 'Artigo em evento internacional', '7h vezes o fator Qualis, até 80h', 80],
  [23, 'Artigo em periódico nacional', '7h vezes o fator Qualis, até 80h', 80],
  [24, 'Artigo em periódico internacional', '8h vezes o fator Qualis, até 80h', 80],
].map(([itemNumber, name, rule, maxHours]) => ({
  itemNumber: itemNumber as number,
  name: name as string,
  rule: rule as string,
  maxHours: maxHours as number,
}))

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
