'use client'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { notFound, useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'

import {
  Button,
  ButtonLink,
  CalcTable,
  Card,
  ConfirmSheet,
  FileRow,
  GroupedList,
  InlineMessage,
  LoadingState,
  Screen,
  StatusBadge,
  TopBar,
} from '@design-system'

import { ROUTES } from '@/constants/routes'
import {
  getArquivoDoComprovante,
  invalidateAfterAtividadeWrite,
  removeAtividade,
} from '@/services/atividades'
import { descreverCalculo, formatQuantidadeCurta } from '@/services/cursos'
import { progressoQueries, simularRemocao } from '@/services/progresso'
import { formatData } from '@/utils/datas'
import { formatHoras, formatHorasInteiras } from '@/utils/formatHoras'
import { formatTamanho } from '@/utils/formatTamanho'

import * as S from './styles'
import { explicarResultado, rotuloQuantidade } from './utils'

export function DetalheAtividade({ id }: { id: string }): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: progresso } = useSuspenseQuery(progressoQueries.resumo())
  const [isRemovendo, setIsRemovendo] = useState(false)
  const [avisoArquivo, setAvisoArquivo] = useState<string | null>(null)

  const remocao = useMutation({
    mutationFn: () => removeAtividade(id),
    onSuccess: () => {
      // Navega antes de invalidar: o refetch desta tela não acharia a atividade e daria 404.
      router.replace(`${ROUTES.atividades}?removida=${encodeURIComponent(atividade?.nome ?? '')}`)
      invalidateAfterAtividadeWrite(queryClient)
    },
  })

  const grupo = progresso.itens.find((i) => i.atividades.some((a) => a.id === id))
  const atividade = grupo?.atividades.find((a) => a.id === id)

  if (!grupo || !atividade) {
    if (remocao.isSuccess) return <LoadingState />
    notFound()
  }

  const { item } = grupo
  const totalSemEla = simularRemocao(progresso, id)
  const rotuloConta =
    atividade.status === 'parcial'
      ? `de ${formatHoras(atividade.valor)} contam no seu total`
      : 'contam no seu total'
  const segundaLinha =
    atividade.motivo === 'antes_do_ingresso'
      ? { label: 'Antes do ingresso', value: formatHoras(0) }
      : {
          label: `${atividade.cabia === 1 ? 'Cabia' : 'Cabiam'} no item ${item.numero}`,
          value: formatHoras(atividade.cabia),
        }

  const abrir = (isDownload: boolean): void => {
    const arquivo = getArquivoDoComprovante(id)
    if (!arquivo) {
      setAvisoArquivo(
        atividade.comprovante.tipo === 'application/pdf'
          ? 'Para economizar espaço, este navegador guardou só o nome e o tamanho do PDF. O arquivo abre aqui apenas na aba em que você o registrou.'
          : 'A foto não coube no espaço do navegador, então ficou guardado só o nome e o tamanho.',
      )
      return
    }
    setAvisoArquivo(
      arquivo.origem === 'copia'
        ? 'Esta é uma cópia reduzida da foto, guardada neste navegador. Para a coordenação, use o arquivo original.'
        : null,
    )
    const link = document.createElement('a')
    link.href = arquivo.url
    link.target = '_blank'
    link.rel = 'noopener'
    if (isDownload) link.download = arquivo.nomeArquivo
    link.click()
  }

  return (
    <Screen
      topBar={
        <TopBar
          variant="back"
          title="Atividade"
          backHref={ROUTES.atividades}
          backLabel="Voltar para Atividades"
        />
      }
    >
      <S.Header>
        <StatusBadge status={atividade.status} />
        <S.Title>{atividade.nome}</S.Title>
        <S.Subtitle>
          Item {item.numero} · {item.nome}
        </S.Subtitle>
      </S.Header>

      <Card>
        <S.Result>
          <span className={S.number({ status: atividade.status })}>
            {formatHoras(atividade.contada)}
          </span>
          <S.ResultLabel>{rotuloConta}</S.ResultLabel>
        </S.Result>
        <S.Why>{explicarResultado(atividade, item, progresso.ingresso)}</S.Why>
        <CalcTable
          caption="Como foi calculado"
          rows={[
            {
              label: descreverCalculo(item, atividade.quantidade),
              value: formatHoras(atividade.valor),
            },
            segundaLinha,
          ]}
          total={{ label: 'Conta no seu total', value: formatHoras(atividade.contada) }}
        />
      </Card>

      <S.Section aria-labelledby="titulo-dados">
        <S.SectionTitle id="titulo-dados">Dados da atividade</S.SectionTitle>
        <GroupedList as="dl">
          <li>
            <S.DataRow>
              <dt>{rotuloQuantidade(item)}</dt>
              <dd>{formatQuantidadeCurta(item, atividade.quantidade)}</dd>
            </S.DataRow>
          </li>
          <li>
            <S.DataRow>
              <dt>Terminou em</dt>
              <dd>{formatData(atividade.dataFim)}</dd>
            </S.DataRow>
          </li>
          <li>
            <S.DataRow>
              <dt>Registrada em</dt>
              <dd>{formatData(atividade.registradaEm)}</dd>
            </S.DataRow>
          </li>
        </GroupedList>
      </S.Section>

      <S.Section aria-labelledby="titulo-comprovante">
        <S.SectionTitle id="titulo-comprovante">Comprovante</S.SectionTitle>
        <FileRow
          name={atividade.comprovante.nome}
          size={formatTamanho(atividade.comprovante.tamanhoBytes)}
          actions={
            <>
              <Button variant="tertiary" onClick={() => abrir(false)}>
                Ver
              </Button>
              <Button variant="tertiary" onClick={() => abrir(true)}>
                Baixar
              </Button>
            </>
          }
        />
        {avisoArquivo && <InlineMessage role="status">{avisoArquivo}</InlineMessage>}
      </S.Section>

      <S.Actions>
        <ButtonLink href={ROUTES.corrigirAtividade(id)} variant="secondary" isBlock>
          Corrigir dados
        </ButtonLink>
        <Button variant="tertiaryDanger" isBlock onClick={() => setIsRemovendo(true)}>
          Remover atividade
        </Button>
      </S.Actions>

      <ConfirmSheet
        isOpen={isRemovendo}
        onClose={() => setIsRemovendo(false)}
        title="Remover esta atividade?"
        actions={
          <>
            <Button
              variant="danger"
              isBlock
              isLoading={remocao.isPending}
              onClick={() => remocao.mutate()}
            >
              {remocao.isPending ? 'Removendo' : 'Remover atividade'}
            </Button>
            <Button variant="secondary" isBlock onClick={() => setIsRemovendo(false)}>
              Manter
            </Button>
          </>
        }
      >
        <p>
          {atividade.nome}{' '}
          {totalSemEla === progresso.total.feito
            ? `sai da lista e o seu total continua em ${formatHorasInteiras(totalSemEla)}.`
            : `sai do seu total, que volta de ${formatHorasInteiras(progresso.total.feito)} para ${formatHorasInteiras(totalSemEla)}.`}{' '}
          O comprovante também é apagado e isso não dá para desfazer.
        </p>
        <InlineMessage>Se só um dado está errado, use Corrigir dados.</InlineMessage>
        {remocao.isError && (
          <InlineMessage tone="danger" role="alert">
            Não deu para remover agora. Confira sua internet e tente de novo.
          </InlineMessage>
        )}
      </ConfirmSheet>
    </Screen>
  )
}
