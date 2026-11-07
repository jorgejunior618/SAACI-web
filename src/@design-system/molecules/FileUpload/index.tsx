'use client'

import { Camera, FileText } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { ChangeEvent, ElementType, ReactNode } from 'react'

import { Button } from '../../atoms/Button'
import { Card } from '../../atoms/Card'
import { Icon } from '../../atoms/Icon'
import { Link } from '../../atoms/Link'
import { formatFileSize, validateFile } from './utils'
import * as S from './styles'

export type FileUploadProps = {
  /** Nome do anexo ("Comprovante"). */
  label: string
  /** Formatos, limite e a dica de frente e verso ("PDF, JPG ou PNG, até 10 MB. Se o certificado tem frente e verso, junte os dois num PDF."). */
  hint: string
  /** Tipos MIME aceitos, como `['application/pdf', 'image/jpeg', 'image/png']`. */
  accept: string[]
  /** Limite de tamanho em MB. */
  maxSizeMb: number
  /** Arquivo anexado. Com ele, o componente mostra o nome, o tamanho e "Trocar" no lugar dos botões. */
  file?: File | null
  /**
   * Erro que vem da tela, como o envio que caiu. Vence o erro de tipo ou tamanho do próprio
   * componente. Se a conexão caiu, o arquivo continua em `file` e a frase diz isso.
   */
  error?: string
  /** Recebe o arquivo escolhido que passou na conferência de tipo e tamanho. */
  onSelect: (file: File) => void
  /** Chamado ao tocar em "Trocar". A tela limpa `file` e o componente volta a mostrar os botões. */
  onReplace: () => void
  /**
   * Linha sobre a leitura por IA, mostrada antes de anexar ("Um serviço de IA lê o seu comprovante.").
   * É obrigatória: a pessoa precisa saber disso antes de enviar. O texto é da tela, porque depende
   * de como o serviço trata os dados.
   */
  notice: string
  /** Texto do link que acompanha `notice` ("Saiba o que guardamos"). */
  privacyLinkLabel: string
  /** Endereço do aviso de privacidade. */
  privacyHref: string
  /** Componente que desenha o link de privacidade, como o `Link` do `next/link`. Padrão: `a`. */
  privacyLinkAs?: ElementType
}

/**
 * Anexa o comprovante por foto ou arquivo, com formatos e limite visíveis antes da escolha.
 *
 * @remarks
 * Não envia nem lê o arquivo: devolve o `File` em `onSelect` e o envio é de `services/`. Só entrega
 * arquivo que passou na conferência de tipo e tamanho; o que não passa vira uma frase de erro com o
 * motivo e o que fazer. A conferência é ajuda na hora, não segurança. Os dois botões são o caminho
 * em qualquer tela, e arrastar e soltar não existe. No desktop "Tirar foto" abre o seletor comum.
 *
 * @example
 * ```tsx
 * <FileUpload
 *   label="Comprovante"
 *   hint="PDF, JPG ou PNG, até 10 MB."
 *   accept={['application/pdf', 'image/jpeg', 'image/png']}
 *   maxSizeMb={10}
 *   file={file}
 *   onSelect={setFile}
 *   onReplace={() => setFile(null)}
 *   notice="Um serviço de IA lê o seu comprovante."
 *   privacyLinkLabel="Saiba o que guardamos"
 *   privacyHref="/privacidade"
 * />
 * ```
 */
export function FileUpload({
  label,
  hint,
  accept,
  maxSizeMb,
  file = null,
  error,
  onSelect,
  onReplace,
  notice,
  privacyLinkLabel,
  privacyHref,
  privacyLinkAs,
}: FileUploadProps): ReactNode {
  const baseId = useId()
  const labelId = `${baseId}-label`
  const hintId = `${baseId}-hint`
  const errorId = `${baseId}-error`

  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const shownError = error ?? localError

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const chosen = event.target.files?.[0]

    // Limpa o campo para escolher o mesmo arquivo de novo disparar `change`.
    event.target.value = ''

    if (!chosen) return

    const message = validateFile(chosen, accept, maxSizeMb)

    setLocalError(message)

    if (message === null) onSelect(chosen)
  }

  function handleReplace(): void {
    setLocalError(null)
    onReplace()
  }

  return (
    <S.Root>
      <S.Label id={labelId}>{label}</S.Label>
      {file ? (
        <Card>
          <S.FileRow>
            <S.FileIcon>
              <Icon icon={FileText} />
            </S.FileIcon>
            <S.FileMain>
              <S.FileName title={file.name}>{file.name}</S.FileName>
              <S.FileSize>{formatFileSize(file.size)}</S.FileSize>
            </S.FileMain>
            <Button variant="tertiary" onClick={handleReplace}>
              Trocar
            </Button>
          </S.FileRow>
        </Card>
      ) : (
        <>
          <S.Hint id={hintId}>{hint}</S.Hint>
          <S.Dropzone
            role="group"
            aria-labelledby={labelId}
            aria-describedby={shownError ? `${hintId} ${errorId}` : hintId}
          >
            <S.Actions>
              <Button
                variant="secondary"
                icon={Camera}
                block
                onClick={() => cameraRef.current?.click()}
              >
                Tirar foto
              </Button>
              <Button variant="secondary" block onClick={() => fileRef.current?.click()}>
                Escolher arquivo
              </Button>
            </S.Actions>
            <S.Support>
              {notice}{' '}
              <Link as={privacyLinkAs} href={privacyHref}>
                {privacyLinkLabel}
              </Link>
            </S.Support>
          </S.Dropzone>
        </>
      )}
      {shownError ? (
        <S.ErrorText id={errorId} role="alert">
          {shownError}
        </S.ErrorText>
      ) : null}
      {/* Escondidos: quem aparece e recebe foco são os botões acima. */}
      <input
        ref={cameraRef}
        hidden
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
      />
      <input ref={fileRef} hidden type="file" accept={accept.join(',')} onChange={handleChange} />
    </S.Root>
  )
}
