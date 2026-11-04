'use client'

import { ChevronRight, Download } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'

import {
  Button,
  ButtonLink,
  Card,
  Icon,
  InlineMessage,
  Notice,
  ProgressBar,
  Status,
  TextButton,
} from '@design-system'

import { ROUTES } from '@/constants/routes'
import { type ProgressoDownload, baixarComprovantes } from '@/services/atividades'
import type { AtividadeComResultado } from '@/services/progresso'
import { formatHorasInteiras } from '@/utils/formatHoras'
import { formatTamanho } from '@/utils/formatTamanho'

import * as S from './styles'

type Estado =
  | { tipo: 'pronto' }
  | { tipo: 'baixando'; progresso: ProgressoDownload }
  | { tipo: 'erro' }
  | { tipo: 'baixado'; progresso: ProgressoDownload }

type Props = {
  feito: number
  contam: AtividadeComResultado[]
  naoContam: AtividadeComResultado[]
  totalItens: number
  // Modo "Escolher quais": a lista marca, este cartão baixa.
  selecionadas: AtividadeComResultado[] | null
  onEscolherQuais: () => void
  onCancelarEscolha: () => void
}

const plural = (n: number, um: string, varios: string): string => (n === 1 ? um : varios)

const descreverArquivos = (atividades: AtividadeComResultado[]): string => {
  const bytes = atividades.reduce((soma, a) => soma + a.comprovante.tamanhoBytes, 0)
  return `${atividades.length} ${plural(atividades.length, 'arquivo', 'arquivos')}, cerca de ${formatTamanho(bytes)}`
}

export function Entrega({
  feito,
  contam,
  naoContam,
  totalItens,
  selecionadas,
  onEscolherQuais,
  onCancelarEscolha,
}: Props): ReactNode {
  const [estado, setEstado] = useState<Estado>({ tipo: 'pronto' })
  const controller = useRef<AbortController | null>(null)
  const alvo = selecionadas ?? contam

  const baixar = async (): Promise<void> => {
    controller.current = new AbortController()
    try {
      const final = await baixarComprovantes(
        alvo.map((a) => a.id),
        {
          signal: controller.current.signal,
          onProgress: (progresso) => setEstado({ tipo: 'baixando', progresso }),
        },
      )
      setEstado({ tipo: 'baixado', progresso: final })
      onCancelarEscolha()
    } catch (error) {
      const isCancelado = error instanceof DOMException && error.name === 'AbortError'
      setEstado(isCancelado ? { tipo: 'pronto' } : { tipo: 'erro' })
    }
  }

  const resumo = [
    `${contam.length} ${plural(contam.length, 'comprovante conta', 'comprovantes contam')}, em ${totalItens} ${plural(totalItens, 'item', 'itens')}`,
    naoContam.length > 0 &&
      `${naoContam.length} não ${plural(naoContam.length, 'conta', 'contam')}`,
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <Card aria-label="Entregar comprovantes">
      <S.Top>
        <S.Total>{formatHorasInteiras(feito)}</S.Total>
        <S.TotalLabel>contam no seu total</S.TotalLabel>
      </S.Top>
      <S.Summary>{resumo}.</S.Summary>

      <S.Body>
        {estado.tipo === 'baixando' ? (
          <>
            <Status>Juntando seus comprovantes</Status>
            <ProgressBar
              value={estado.progresso.bytesProntos}
              max={estado.progresso.totalBytes}
              size="lg"
              label="Progresso do download"
            />
            <S.Support>
              {estado.progresso.arquivosProntos} de {estado.progresso.totalArquivos} arquivos ·{' '}
              {formatTamanho(estado.progresso.bytesProntos)} de{' '}
              {formatTamanho(estado.progresso.totalBytes)}
            </S.Support>
            <S.Support>
              Pode continuar usando o app. O arquivo vai para os downloads do celular.
            </S.Support>
            <div>
              <Button variant="tertiary" onClick={() => controller.current?.abort()}>
                Cancelar download
              </Button>
            </div>
          </>
        ) : (
          <>
            {estado.tipo === 'erro' && (
              <Notice title="O download parou no meio" tone="danger" surface="card" role="alert">
                Nada foi salvo no celular. Confira sua internet e tente de novo. Se continuar, abra
                uma atividade e baixe o comprovante dela sozinho.
              </Notice>
            )}
            {estado.tipo === 'baixado' && (
              <Notice title="Comprovantes juntados" tone="success" surface="card" role="status">
                {estado.progresso.totalArquivos} arquivos, uma pasta por item. Nesta versão o
                arquivo compactado ainda é simulado e não chega aos downloads.
              </Notice>
            )}
            <Button size="lg" isBlock disabled={alvo.length === 0} onClick={() => void baixar()}>
              <Icon icon={Download} />
              {estado.tipo === 'erro'
                ? 'Tentar de novo'
                : selecionadas
                  ? `Baixar ${selecionadas.length} ${plural(selecionadas.length, 'escolhido', 'escolhidos')}`
                  : 'Baixar os que contam'}
            </Button>
            <S.Support>
              {alvo.length > 0
                ? `${descreverArquivos(alvo)}. Vem num arquivo compactado com uma pasta por item.`
                : 'Marque na lista os comprovantes que quer baixar.'}
            </S.Support>
            {!selecionadas && naoContam.length > 0 && (
              <InlineMessage tone="danger">
                {naoContam.length === 1
                  ? `1 comprovante não conta e fica de fora: ${naoContam[0].nome}.`
                  : `${naoContam.length} comprovantes não contam e ficam de fora: ${naoContam.map((a) => a.nome).join(', ')}.`}
              </InlineMessage>
            )}
          </>
        )}
      </S.Body>

      <S.Links>
        {selecionadas ? (
          <TextButton onClick={onCancelarEscolha}>Cancelar escolha</TextButton>
        ) : (
          <Button variant="tertiary" onClick={onEscolherQuais}>
            Escolher quais
          </Button>
        )}
        <ButtonLink href={ROUTES.formulario} variant="tertiary">
          Ver meu pedido
          <Icon icon={ChevronRight} size={16} />
        </ButtonLink>
      </S.Links>
    </Card>
  )
}
