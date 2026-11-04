import type { ReactNode } from 'react'

import { RulePanel, TextButton } from '@design-system'

import { type Item, descreverCalculo } from '@/services/cursos'
import type { Simulacao } from '@/services/progresso'
import { formatHoras, formatHorasInteiras } from '@/utils/formatHoras'

type Props = {
  item: Item
  quantidade: number | null
  // Null quando a quantidade ainda não é um número válido: a conta mostra "falta".
  simulacao: Simulacao | null
  onTrocarItem: () => void
  variant: 'registro' | 'correcao'
}

function aviso(
  item: Item,
  quantidade: number | null,
  simulacao: Simulacao | null,
): string | undefined {
  if (!simulacao || simulacao.vaiContar >= simulacao.valor) return undefined

  if (simulacao.motivo === 'antes_do_ingresso') {
    return 'A data é anterior ao seu ingresso no curso. A atividade fica guardada, mas não soma horas, porque só contam atividades feitas depois do ingresso.'
  }
  if (simulacao.vaiContar === 0) {
    return `${item.nomeCurto} já chegou ao limite de ${formatHorasInteiras(item.limite)}. A atividade fica guardada, mas não soma horas.`
  }
  if (quantidade !== null && item.unidade.tipo === 'horas') {
    const fora = formatHoras(simulacao.valor - simulacao.vaiContar)
    return `Com ${quantidade}h, ela vale ${formatHoras(simulacao.valor)}, mas só cabem ${formatHoras(simulacao.vaiContar)} no item ${item.numero}. Os outros ${fora} ficam de fora.`
  }
  return `Essa atividade vale ${formatHoras(simulacao.valor)}, mas só cabem mais ${formatHoras(simulacao.vaiContar)} neste item.`
}

// A regra do item e a prévia da conta, antes de registrar ou salvar a correção.
export function PainelDaRegra({
  item,
  quantidade,
  simulacao,
  onTrocarItem,
  variant,
}: Props): ReactNode {
  const cabem = simulacao ? formatHoras(simulacao.cabem) : formatHoras(item.limite)
  const usadas = simulacao?.usadoPorOutras ?? 0
  const valor = simulacao ? formatHoras(simulacao.valor) : 'falta'
  const vaiContar = simulacao ? formatHoras(simulacao.vaiContar) : 'falta'
  const primeiraLinha =
    quantidade !== null
      ? descreverCalculo(item, quantidade)
      : descreverCalculo(item, 1).replace(/^1h? ?/, `${item.campoQuantidade} `)

  return (
    <RulePanel
      head={`Item ${item.numero} · ${item.nome}`}
      headAction={<TextButton onClick={onTrocarItem}>Trocar item</TextButton>}
      ruleText={item.regraTexto}
      fit={
        variant === 'registro' ? (
          <>
            Ainda cabem <b>{cabem}</b> neste item
          </>
        ) : (
          <>
            Cabem <b>{cabem}</b> para esta atividade
          </>
        )
      }
      used={
        variant === 'registro'
          ? `${formatHorasInteiras(usadas)} de ${formatHorasInteiras(item.limite)}`
          : `${formatHorasInteiras(usadas)} de outras atividades`
      }
      usedValue={usadas}
      limit={item.limite}
      calc={{
        caption:
          variant === 'registro'
            ? 'Quanto essa atividade vai contar'
            : 'Quanto ela vai contar com a correção',
        rows: [
          { label: primeiraLinha, value: valor },
          { label: 'Cabem neste item', value: cabem },
        ],
        total: { label: 'Vai contar', value: vaiContar },
      }}
      warning={aviso(item, quantidade, simulacao)}
    />
  )
}
