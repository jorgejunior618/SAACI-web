'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button, Icon, Link, Notice } from '@design-system'

import { ProofsDownload } from '@/components/ProofsDownload'
import type { Activity } from '@/services/activities'
import type { RuleItem } from '@/services/rules'
import { isCounting } from '@/utils/is-counting'

import { FormDownload } from '../FormDownload'
import type { FormDownloadData } from '../FormDownload'
import { buildProtocolEmail, PROTOCOL_EMAIL } from './utils'
import * as S from './styles'

type CopyState = 'idle' | 'copied' | 'failed'

// Os itens que o aluno marca. Os dois primeiros são os downloads do passo 1.
type CheckKey = 'form' | 'proofs' | 'email' | 'reception' | 'followup'

/** Props de {@link DeliverySteps}. */
export type DeliveryStepsProps = {
  /** Nome do curso, para o e-mail do protocolo. */
  courseName: string
  /** Dados do formulário, para o PDF e para o e-mail. */
  form: FormDownloadData
  /** Todas as atividades do aluno. Só as que contam entram no arquivo dos comprovantes. */
  activities: Activity[]
  /** Itens do curso, para o nome da pasta de cada item no arquivo dos comprovantes. */
  ruleItems: RuleItem[]
}

type ToggleProps = {
  isChecked: boolean
  checkedLabel: string
  uncheckedLabel: string
  onToggle: () => void
}

// Marcar e desmarcar é um botão só, para o aluno corrigir um toque errado. O rótulo já diz o estado,
// então não leva `aria-pressed`: os dois juntos fariam o leitor de tela anunciar o estado duas vezes.
function Toggle({ isChecked, checkedLabel, uncheckedLabel, onToggle }: ToggleProps): ReactNode {
  return (
    <Link as="button" type="button" isStandalone onClick={onToggle}>
      {isChecked ? checkedLabel : uncheckedLabel}
    </Link>
  )
}

/**
 * Roadmap da entrega do pedido no IFCE: baixar, mandar o e-mail, ir à recepção e acompanhar.
 *
 * @remarks
 * O processo é manual e fora do app, então só o aluno sabe o que já fez. Cada item se marca à mão e
 * se desmarca. Baixar o formulário preenchido e o arquivo dos comprovantes marca o item sozinho. O
 * passo 1 fica feito quando os dois estão marcados, ou só o formulário se nenhum comprovante conta.
 * O que está marcado vive só nesta tela: sair ou recarregar desmarca tudo. O passo da vez, o
 * primeiro que falta, ganha o contorno da marca. O `mailto:` do passo 2 não anexa arquivo, e o texto
 * diz isso. Os dados que ainda não temos aparecem como marcador.
 *
 * @example
 * ```tsx
 * <DeliverySteps courseName={course.name} form={form} activities={activities} ruleItems={ruleItems} />
 * ```
 */
export function DeliverySteps({
  courseName,
  form,
  activities,
  ruleItems,
}: DeliveryStepsProps): ReactNode {
  const [checked, setChecked] = useState<ReadonlySet<CheckKey>>(new Set())
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const hasProofs = activities.some(isCounting)
  const email = buildProtocolEmail({
    name: form.studentName,
    enrollmentId: form.enrollmentId,
    courseName,
    totalHours: form.totalHours,
  })

  function setCheck(key: CheckKey, value: boolean): void {
    setChecked((current) => {
      const next = new Set(current)

      if (value) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function toggle(key: CheckKey): () => void {
    return () => setCheck(key, !checked.has(key))
  }

  async function copyText(): Promise<void> {
    try {
      await navigator.clipboard.writeText(email.plainText)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const stepDone = [
    checked.has('form') && (!hasProofs || checked.has('proofs')),
    checked.has('email'),
    checked.has('reception'),
    checked.has('followup'),
  ]
  // O primeiro passo que falta. `-1` quando todos estão feitos.
  const currentIndex = stepDone.indexOf(false)

  const steps: { title: string; detail: ReactNode }[] = [
    {
      title: 'Baixar o formulário e os comprovantes',
      detail: (
        <>
          <S.Sub>
            <S.SubHeader>
              <S.SubTitle>Formulário em PDF</S.SubTitle>
              {checked.has('form') ? (
                <S.Done>
                  <Icon icon={Check} size="sm" />
                  Baixado
                </S.Done>
              ) : null}
            </S.SubHeader>
            <FormDownload {...form} onDownloaded={() => setCheck('form', true)} />
            <Toggle
              isChecked={checked.has('form')}
              checkedLabel="Desmarcar formulário baixado"
              uncheckedLabel="Já baixei o formulário"
              onToggle={toggle('form')}
            />
          </S.Sub>
          {hasProofs ? (
            <S.Sub>
              <S.SubHeader>
                <S.SubTitle>Comprovantes que contam</S.SubTitle>
                {checked.has('proofs') ? (
                  <S.Done>
                    <Icon icon={Check} size="sm" />
                    Baixados
                  </S.Done>
                ) : null}
              </S.SubHeader>
              <ProofsDownload
                activities={activities}
                ruleItems={ruleItems}
                onDownloaded={() => setCheck('proofs', true)}
              />
              <Toggle
                isChecked={checked.has('proofs')}
                checkedLabel="Desmarcar comprovantes baixados"
                uncheckedLabel="Já baixei os comprovantes"
                onToggle={toggle('proofs')}
              />
            </S.Sub>
          ) : (
            <S.DetailText>
              Nenhum comprovante conta ainda, então não há arquivo de comprovantes para baixar.
            </S.DetailText>
          )}
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
            <Button as="a" href={email.mailtoHref} variant="secondary" block>
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
          <Toggle
            isChecked={checked.has('email')}
            checkedLabel="Desmarcar e-mail enviado"
            uncheckedLabel="Já enviei o e-mail"
            onToggle={toggle('email')}
          />
        </>
      ),
    },
    {
      title: 'Ir à recepção do IFCE',
      detail: (
        <>
          <S.DetailText>
            Preencha o formulário de lá. O atendente abre o seu protocolo com o que você enviou por
            e-mail.
          </S.DetailText>
          {/* O endereço vem do relatório de recredenciamento do e-MEC. O horário vem da página de horários de funcionamento do campus Fortaleza (recepção central, atualizada em 26/08/2025). */}
          <S.DetailText>
            Av. Treze de Maio, 2081, Benfica, Fortaleza. Atendimento das 8h às 19h.
          </S.DetailText>
          <Toggle
            isChecked={checked.has('reception')}
            checkedLabel="Desmarcar ida à recepção"
            uncheckedLabel="Já fui à recepção"
            onToggle={toggle('reception')}
          />
        </>
      ),
    },
    {
      title: 'Acompanhar pelo e-mail',
      detail: (
        <>
          <S.DetailText>A resposta chega por e-mail. Olhe também a caixa de spam.</S.DetailText>
          <S.DetailText>A resposta pode levar alguns dias úteis.</S.DetailText>
          <Toggle
            isChecked={checked.has('followup')}
            checkedLabel="Desmarcar resposta recebida"
            uncheckedLabel="Já recebi a resposta"
            onToggle={toggle('followup')}
          />
        </>
      ),
    },
  ]

  return (
    <S.List>
      {steps.map((step, index) => {
        const isDone = stepDone[index] === true
        const state = isDone ? 'done' : index === currentIndex ? 'current' : 'upcoming'

        return (
          <S.Step key={step.title}>
            {isDone ? (
              <S.Marker state="done" role="img" aria-label={`Passo ${index + 1} feito`}>
                <Icon icon={Check} size="sm" />
              </S.Marker>
            ) : (
              <S.Marker state={state}>{index + 1}</S.Marker>
            )}
            <S.Body>
              <S.StepTitle>{step.title}</S.StepTitle>
              <S.Detail>{step.detail}</S.Detail>
            </S.Body>
          </S.Step>
        )
      })}
    </S.List>
  )
}
