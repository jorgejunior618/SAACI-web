'use client'

import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { useId } from 'react'

import { AppFrame, Button, Card, Icon, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

import { DeliverySteps } from '../../../_components/DeliverySteps'
import type { ProtocolEmailInput } from '../../../_components/DeliverySteps'
import { formatGeneratedAt, formatKilobytes } from '../../utils'
import type { DownloadedFile } from '../../utils'
import * as S from './styles'

/** Props de {@link DownloadedStep}. */
export type DownloadedStepProps = {
  /** O PDF que acabou de ser gerado. */
  file: DownloadedFile
  /** Dados do aluno, para o e-mail do protocolo vir preenchido. */
  email: ProtocolEmailInput
  /** Volta para a conferência. */
  onBack: () => void
}

// Abre o PDF numa aba nova. O endereço é liberado depois, para a aba ter tempo de ler o arquivo.
function openFile(blob: Blob): void {
  const url = URL.createObjectURL(blob)

  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/**
 * Passo de baixado: confirma o download, mostra o arquivo e guia a entrega no protocolo.
 *
 * @remarks
 * O passo 1 do roadmap aparece feito, porque o aluno acabou de baixar o formulário. Isso vem da
 * tela estar aberta, não de dado guardado. "Abrir" gera um endereço novo do mesmo PDF na memória, e
 * nada volta a ser gerado. O link do guia completo leva para a rota do guia de entrega.
 *
 * @example
 * ```tsx
 * <DownloadedStep file={file} email={email} onBack={() => setStep({ name: 'review' })} />
 * ```
 */
export function DownloadedStep({ file, email, onBack }: DownloadedStepProps): ReactNode {
  const nextId = useId()

  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Seu pedido" onBack={onBack} />}
      bottomNav={<MainNav />}
    >
      <S.Page>
        <StateScreen
          variant="success"
          title="Formulário baixado"
          description={`Está nos downloads do celular, gerado em ${formatGeneratedAt(file.generatedAt)}.`}
        />

        <Card>
          <S.FileRow>
            <Icon icon={FileText} size="lg" />
            <S.FileMain>
              <S.FileName title={file.fileName}>{file.fileName}</S.FileName>
              <S.FileSize>{formatKilobytes(file.blob.size)}</S.FileSize>
            </S.FileMain>
            <Button variant="tertiary" onClick={() => openFile(file.blob)}>
              Abrir
            </Button>
          </S.FileRow>
        </Card>

        <Card as="section" aria-labelledby={nextId}>
          <S.Next>
            <S.NextHeader>
              <S.NextLabel>Próximo passo</S.NextLabel>
              <S.NextTitle id={nextId}>Entregar na coordenação</S.NextTitle>
            </S.NextHeader>
            <DeliverySteps
              variant="compact"
              doneCount={1}
              email={email}
              guideHref="/atividades/pedido/como-entregar"
            />
          </S.Next>
        </Card>
      </S.Page>
    </AppFrame>
  )
}
