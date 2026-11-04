'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ButtonLink, Disclosure, ItemList, Notice, Screen, TopBar, TotalCard } from '@design-system'

import { ROUTES } from '@/constants/routes'
import { type ItemComProgresso, progressoQueries } from '@/services/progresso'
import { formatHorasInteiras } from '@/utils/formatHoras'

import { Empty } from './Empty'
import { CartaoDoItem } from './_components/CartaoDoItem'
import * as S from './styles'

const listarNumeros = (numeros: number[]): string =>
  numeros.length <= 1
    ? numeros.join('')
    : `${numeros.slice(0, -1).join(', ')} e ${numeros[numeros.length - 1]}`

function avisoItemCompleto(numero: number, itens: ItemComProgresso[]): string {
  const comEspaco = itens.filter((i) => i.usado > 0 && !i.isCheio).map((i) => i.item.numero)
  const semHoras = itens.filter((i) => i.usado === 0 && i.registrado === 0).length
  const partes = [
    comEspaco.length > 0 && `nos itens ${listarNumeros(comEspaco)}`,
    semHoras > 0 && `em outras ${semHoras} atividades`,
  ].filter(Boolean)

  return partes.length > 0
    ? `Ainda dá para somar ${partes.join(' e ')}.`
    : `O item ${numero} não aceita mais horas.`
}

export function Painel(): ReactNode {
  const { data: progresso } = useSuspenseQuery(progressoQueries.resumo())
  const { total, itens, itemRecemCompleto } = progresso

  const comHoras = itens
    .filter((i) => i.registrado > 0 || i.usado > 0)
    // O item que acabou de encher sobe para o topo.
    .sort(
      (a, b) =>
        Number(b.item.numero === itemRecemCompleto) - Number(a.item.numero === itemRecemCompleto),
    )
  const semHoras = itens.filter((i) => i.registrado === 0 && i.usado === 0)
  const isVazio = itens.every((i) => i.atividades.length === 0)

  return (
    <Screen topBar={<TopBar variant="brand" />} label="Início">
      {itemRecemCompleto && total.faltam > 0 && (
        <Notice title={`Você completou o item ${itemRecemCompleto}`} tone="success" role="status">
          {avisoItemCompleto(itemRecemCompleto, itens)}
        </Notice>
      )}

      <TotalCard feito={total.feito} meta={total.meta} faltam={total.faltam}>
        <p>
          {total.feito > total.meta
            ? `Seus itens somam ${formatHorasInteiras(total.feito)}. O que passa de ${formatHorasInteiras(total.meta)} não é aproveitado.`
            : 'Agora é juntar o formulário e os comprovantes para a coordenação.'}
        </p>
        <ButtonLink href={ROUTES.formulario} isBlock>
          Ver como entregar seu pedido
        </ButtonLink>
      </TotalCard>

      {isVazio ? (
        <Empty meta={total.meta} />
      ) : (
        <>
          <S.Section aria-labelledby="titulo-horas">
            <S.SectionTitle id="titulo-horas">Onde você já tem horas</S.SectionTitle>
            <S.Cards>
              {comHoras.map((itemProgresso) => (
                <CartaoDoItem key={itemProgresso.item.numero} progresso={itemProgresso} />
              ))}
            </S.Cards>
          </S.Section>

          {semHoras.length > 0 && (
            <Disclosure
              summary={
                <>
                  <span className={S.disclosureTitle}>Outras atividades que contam</span>
                  <span className={S.disclosureCount}>{semHoras.length}</span>
                </>
              }
            >
              <ItemList
                label="Outras atividades que contam"
                isFlush
                items={semHoras.map(({ item }) => ({
                  id: String(item.numero),
                  aside: String(item.numero),
                  title: item.nome,
                  description: item.regraResumo,
                }))}
              />
            </Disclosure>
          )}
        </>
      )}
    </Screen>
  )
}
