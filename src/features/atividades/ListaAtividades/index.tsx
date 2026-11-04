'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { type ReactNode, useState, useSyncExternalStore } from 'react'

import { Notice, Screen, TopBar } from '@design-system'

import { progressoQueries } from '@/services/progresso'
import { formatHorasInteiras } from '@/utils/formatHoras'

import { Empty } from './Empty'
import { Entrega } from './_components/Entrega'
import { GrupoDoItem } from './_components/GrupoDoItem'
import * as S from './styles'

const subscribeHash = (callback: () => void): (() => void) => {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

export function ListaAtividades(): ReactNode {
  const { data: progresso } = useSuspenseQuery(progressoQueries.resumo())
  const searchParams = useSearchParams()
  const removida = searchParams.get('removida')
  // O cartão do Início leva direto ao grupo do item, já aberto.
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => '',
  )
  const [selecionados, setSelecionados] = useState<Set<string> | null>(null)

  const grupos = progresso.itens.filter((i) => i.atividades.length > 0)
  const todas = grupos.flatMap((g) => g.atividades)
  const contam = todas.filter((a) => a.contada > 0)
  const naoContam = todas.filter((a) => a.contada === 0)
  const { feito, faltam } = progresso.total

  const alternar = (id: string): void => {
    setSelecionados((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  return (
    <Screen topBar={<TopBar variant="tab" title="Atividades" />}>
      {removida && (
        <Notice title="Atividade removida" tone="success" role="status">
          {removida} saiu do seu total, que agora é {formatHorasInteiras(feito)}.
          {faltam > 0 && ` Faltam ${formatHorasInteiras(faltam)} para completar suas horas.`}
        </Notice>
      )}

      {grupos.length === 0 ? (
        <Empty />
      ) : (
        <>
          <Entrega
            feito={feito}
            contam={contam}
            naoContam={naoContam}
            totalItens={new Set(contam.map((a) => a.itemNumero)).size}
            selecionadas={selecionados && todas.filter((a) => selecionados.has(a.id))}
            onEscolherQuais={() => setSelecionados(new Set(contam.map((a) => a.id)))}
            onCancelarEscolha={() => setSelecionados(null)}
          />

          <S.Section aria-labelledby="titulo-por-item">
            <S.SectionTitle id="titulo-por-item">Por item</S.SectionTitle>
            {grupos.map((grupo) => (
              <GrupoDoItem
                key={grupo.item.numero}
                progresso={grupo}
                isOpen={
                  hash === `#item-${grupo.item.numero}` ||
                  selecionados !== null ||
                  grupo.atividades.some((a) => a.status === 'nao_conta')
                }
                selecionados={selecionados}
                onAlternar={alternar}
              />
            ))}
          </S.Section>
        </>
      )}
    </Screen>
  )
}
