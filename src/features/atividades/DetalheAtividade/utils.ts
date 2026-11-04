import { descreverRegraCurta } from '@/services/cursos'
import type { Item } from '@/services/cursos'
import type { AtividadeComResultado } from '@/services/progresso'
import { formatData } from '@/utils/datas'
import { formatHoras, formatHorasInteiras } from '@/utils/formatHoras'

// O porquê das horas, em linguagem simples.
export function explicarResultado(
  atividade: AtividadeComResultado,
  item: Item,
  ingresso: string,
): string {
  const regra = descreverRegraCurta(item)

  if (atividade.motivo === 'antes_do_ingresso') {
    return `Não conta porque terminou em ${formatData(atividade.dataFim)}, antes do seu ingresso em ${ingresso}. Só valem atividades feitas depois do ingresso.`
  }
  if (atividade.motivo === 'item_cheio') {
    return `Não conta porque o item ${item.numero} já tinha chegado ao limite de ${formatHorasInteiras(item.limite)} com atividades mais antigas. Ela fica guardada, mas não soma horas.`
  }
  if (atividade.status === 'parcial') {
    return `Ficou ${formatHoras(atividade.valor - atividade.contada)} de fora porque o item ${item.numero} chegou ao limite de ${formatHorasInteiras(item.limite)}. As atividades mais antigas contam primeiro, e esta terminou depois das outras.`
  }
  return `Conta inteira: ${regra}, e o item ${item.numero} ainda tinha espaço.`
}

// Rótulo curto da quantidade na lista de dados: "Horas do certificado", "Palestras".
export function rotuloQuantidade(item: Item): string {
  switch (item.unidade.tipo) {
    case 'horas':
      return item.campoQuantidade
    case 'contagem':
      return item.unidade.plural.charAt(0).toUpperCase() + item.unidade.plural.slice(1)
    case 'qualis':
      return 'Fator Qualis'
  }
}
