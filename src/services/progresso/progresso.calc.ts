import type { Item } from '../cursos/cursos.types'

// Regra única de cálculo (RNF20): painel, atividades, detalhe e formulário leem daqui.
// Fonte: design-system/docs/regras-de-negocio.md e RF14.

export type StatusAtividade = 'conta' | 'parcial' | 'nao_conta'
export type MotivoNaoConta = 'antes_do_ingresso' | 'item_cheio'

export type AtividadeParaCalculo = {
  id: string
  itemNumero: number
  quantidade: number
  dataFim: string
  registradaEm: string
}

export type ResultadoAtividade = {
  id: string
  valor: number
  contada: number
  // Quanto ainda cabia no item quando chegou a vez desta atividade.
  cabia: number
  status: StatusAtividade
  motivo: MotivoNaoConta | null
}

export type ResultadoItem = {
  numero: number
  limite: number
  usado: number
  cabem: number
  registrado: number
  excedente: number
  isCheio: boolean
  atividades: ResultadoAtividade[]
}

// Uma casa decimal, sempre para baixo (RF14). O epsilon evita 2.9999 virar 2,9.
export function arredondarHoras(horas: number): number {
  return Math.floor(horas * 10 + 1e-6) / 10
}

export function valorDaAtividade(item: Pick<Item, 'conversao'>, quantidade: number): number {
  return arredondarHoras((quantidade * item.conversao.horas) / item.conversao.por)
}

// Semestre .1 começa em janeiro e .2 em julho. Confirmar com a coordenação.
export function inicioDoSemestre(semestre: string): string {
  const [ano, periodo] = semestre.split('.')
  return `${ano}-${periodo === '1' ? '01' : '07'}-01`
}

export function isAntesDoIngresso(dataFim: string, ingresso: string): boolean {
  return dataFim < inicioDoSemestre(ingresso)
}

// Dentro de um item, as atividades mais antigas (data de término) contam primeiro.
const ordemDeContagem = (a: AtividadeParaCalculo, b: AtividadeParaCalculo): number =>
  a.dataFim.localeCompare(b.dataFim) || a.registradaEm.localeCompare(b.registradaEm)

export function calcularItem(
  item: Pick<Item, 'numero' | 'limite' | 'conversao'>,
  atividades: readonly AtividadeParaCalculo[],
  ingresso: string,
): ResultadoItem {
  let usado = 0
  let registrado = 0

  const resultados = [...atividades]
    .filter((atividade) => atividade.itemNumero === item.numero)
    .sort(ordemDeContagem)
    .map((atividade): ResultadoAtividade => {
      const valor = valorDaAtividade(item, atividade.quantidade)
      const cabia = arredondarHoras(Math.max(item.limite - usado, 0))

      if (isAntesDoIngresso(atividade.dataFim, ingresso)) {
        return {
          id: atividade.id,
          valor,
          contada: 0,
          cabia,
          status: 'nao_conta',
          motivo: 'antes_do_ingresso',
        }
      }

      registrado += valor
      const contada = arredondarHoras(Math.min(valor, cabia))
      usado += contada

      const status: StatusAtividade =
        contada === 0 ? 'nao_conta' : contada < valor ? 'parcial' : 'conta'
      return {
        id: atividade.id,
        valor,
        contada,
        cabia,
        status,
        motivo: contada === 0 ? 'item_cheio' : null,
      }
    })

  usado = arredondarHoras(usado)
  return {
    numero: item.numero,
    limite: item.limite,
    usado,
    cabem: arredondarHoras(Math.max(item.limite - usado, 0)),
    registrado: arredondarHoras(registrado),
    excedente: arredondarHoras(Math.max(registrado - usado, 0)),
    isCheio: usado >= item.limite,
    atividades: resultados,
  }
}

export type ResultadoTotal = {
  meta: number
  // Soma de tudo que conta, pode passar da meta.
  feito: number
  // O que vai no formulário.
  pedido: number
  faltam: number
}

export function calcularTotal(
  itens: readonly Pick<ResultadoItem, 'usado'>[],
  meta: number,
): ResultadoTotal {
  // Total geral é inteiro, sempre para baixo (RF14).
  const feito = Math.floor(itens.reduce((soma, item) => soma + item.usado, 0) + 1e-6)

  return {
    meta,
    feito,
    pedido: Math.min(feito, meta),
    faltam: Math.max(meta - feito, 0),
  }
}
