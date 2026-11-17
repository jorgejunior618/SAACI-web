'use client'

import { Check } from 'lucide-react'
import NextLink from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button, Icon, Link, Notice } from '@design-system'

import { buildProtocolEmail, PROTOCOL_EMAIL } from './utils'
import type { ProtocolEmailInput } from './utils'
import * as S from './styles'

export type { ProtocolEmailInput } from './utils'

type CopyState = 'idle' | 'copied' | 'failed'

/** Props de {@link DeliverySteps}. */
export type DeliveryStepsProps = {
  /**
   * `compact`: só o passo da vez mostra o detalhe, e os outros ficam em uma linha. `full`: todos
   * mostram o detalhe, para a tela do guia.
   */
  variant: 'compact' | 'full'
  /** Quantos passos o aluno já fez, de baixo para cima. Padrão: `0`. Só pinta o roadmap. */
  doneCount?: number
  /** Dados do aluno, para o e-mail do protocolo vir preenchido. */
  email: ProtocolEmailInput
  /** Endereço do guia completo. Só aparece no `compact`. */
  guideHref?: string
}

/**
 * Roadmap da entrega do pedido no IFCE: baixar, mandar o e-mail, ir ao protocolo e acompanhar.
 *
 * @remarks
 * O processo é manual e este componente só orienta: não guarda passo feito. O `doneCount` vem da
 * tela e só pinta os círculos (hoje, "baixou o formulário" é o passo 1). O passo do e-mail tem o
 * link `mailto:` com o texto pronto e "Copiar texto" de reserva. O `mailto:` não anexa arquivo, e o
 * texto diz isso. Os dados do protocolo que ainda não temos aparecem como marcador.
 *
 * @example
 * ```tsx
 * <DeliverySteps
 *   variant="compact"
 *   doneCount={1}
 *   email={{ name, enrollmentId, courseName, totalHours }}
 *   guideHref="/atividades/pedido/como-entregar"
 * />
 * ```
 */
export function DeliverySteps({
  variant,
  doneCount = 0,
  email,
  guideHref,
}: DeliveryStepsProps): ReactNode {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const protocolEmail = buildProtocolEmail(email)
  const currentIndex = variant === 'compact' ? doneCount : null

  async function copyText(): Promise<void> {
    try {
      await navigator.clipboard.writeText(protocolEmail.plainText)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const steps: { title: string; detail: ReactNode }[] = [
    {
      title: 'Baixar o formulário e os comprovantes',
      detail: (
        <>
          <S.DetailText>
            O formulário em PDF desta tela e o arquivo com os comprovantes que contam.
          </S.DetailText>
          <Link as={NextLink} href="/atividades" isStandalone>
            Baixar os comprovantes que contam
          </Link>
        </>
      ),
    },
    {
      title: 'Enviar o e-mail para o protocolo',
      detail: (
        <>
          <S.DetailText>
            Escreva para <S.Address>{PROTOCOL_EMAIL}</S.Address> com o formulário e o arquivo dos
            comprovantes anexados. O e-mail abre sem anexo: anexe os dois antes de enviar.
          </S.DetailText>
          <S.Actions>
            <Button as="a" href={protocolEmail.mailtoHref} variant="secondary" block>
              Escrever o e-mail
            </Button>
            <Button variant="tertiary" block onClick={copyText}>
              Copiar texto
            </Button>
            {copyState === 'copied' ? (
              <Notice tone="success">Texto copiado. Cole no seu e-mail.</Notice>
            ) : null}
            {copyState === 'failed' ? (
              <Notice tone="danger">
                Não deu para copiar. Toque em Escrever o e-mail ou digite o endereço acima.
              </Notice>
            ) : null}
          </S.Actions>
        </>
      ),
    },
    {
      title: 'Ir ao protocolo e preencher o formulário de lá',
      detail: (
        <>
          <S.DetailText>
            O atendente abre o seu protocolo com o que você enviou por e-mail.
          </S.DetailText>
          {/* TODO: provisório. Trocar os marcadores pelo dado real quando a coordenação informar. */}
          <S.DetailText>[LOCAL E HORÁRIO DO PROTOCOLO]</S.DetailText>
          <S.DetailText>[O PROTOCOLO INFORMA UM NÚMERO?]</S.DetailText>
        </>
      ),
    },
    {
      title: 'Acompanhar pelo e-mail',
      detail: (
        <>
          <S.DetailText>A resposta chega por e-mail. Olhe também a caixa de spam.</S.DetailText>
          {/* TODO: provisório. Trocar o marcador pelo prazo real. */}
          <S.DetailText>[PRAZO DE RESPOSTA DA COORDENAÇÃO]</S.DetailText>
        </>
      ),
    },
  ]

  return (
    <S.Root>
      <S.List>
        {steps.map((step, index) => {
          const state = index < doneCount ? 'done' : index === currentIndex ? 'current' : 'upcoming'

          return (
            <S.Step key={step.title}>
              {state === 'done' ? (
                <S.Marker state="done" role="img" aria-label={`Passo ${index + 1} feito`}>
                  <Icon icon={Check} size="sm" />
                </S.Marker>
              ) : (
                <S.Marker state={state}>{index + 1}</S.Marker>
              )}
              <S.Body>
                <S.StepTitle>{step.title}</S.StepTitle>
                {variant === 'full' || state === 'current' ? (
                  <S.Detail>{step.detail}</S.Detail>
                ) : null}
              </S.Body>
            </S.Step>
          )
        })}
      </S.List>
      {variant === 'compact' && guideHref ? (
        <Link as={NextLink} href={guideHref} isStandalone>
          Ver o guia completo
        </Link>
      ) : null}
    </S.Root>
  )
}
