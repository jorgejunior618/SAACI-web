// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useCallback, useId, useImperativeHandle, useRef } from 'react'
import type { ReactNode, Ref, RefObject } from 'react'

import * as S from './styles'

/** Comandos do sheet, expostos pelo `ref`. */
export type BottomSheetHandle = {
  /** Abre o sheet como modal e leva o foco para o título. Não faz nada se já está aberto. */
  open: () => void
  /** Fecha o sheet e devolve o foco. Não faz nada se já está fechado. */
  close: () => void
}

export type BottomSheetProps = {
  /**
   * Comandos para abrir e fechar. A tela guarda o `ref` (`useRef<BottomSheetHandle>(null)`) e chama
   * `ref.current?.open()` no gatilho e `ref.current?.close()` nos botões do sheet.
   */
  ref?: Ref<BottomSheetHandle>
  /** Pergunta que diz o que vai acontecer ("Remover esta atividade?"). Recebe o foco ao abrir. */
  title: string
  /** A consequência: o que some e o que continua. Para corrigir um dado, diga como. */
  description: string
  /**
   * Os botões, empilhados em largura total: a ação destrutiva (`Button variant="danger" block`) e a
   * de manter (`Button variant="secondary" block`). Verbos claros, "Manter" ou "Cancelar", nunca "Não".
   */
  actions: ReactNode
  /**
   * Para onde o foco volta ao fechar. Sem ele, volta ao elemento que tinha o foco quando o sheet
   * abriu. Passe quando esse elemento some junto com a ação, como o botão da linha removida.
   */
  returnFocusRef?: RefObject<HTMLElement | null>
  /**
   * Chamado depois que o sheet fecha, por qualquer caminho: Esc, toque no véu, o Voltar do aparelho
   * ou `ref.current.close()`. Não diz qual foi; a ação escolhida é da tela.
   */
  onClose?: () => void
}

/**
 * Painel que sobe da base da tela para confirmar uma ação que apaga algo, sem sair da tela.
 *
 * @remarks
 * Abre e fecha por comandos no `ref`, sem estado `open` na tela. Usa o `<dialog>` nativo com
 * `showModal()`, então o fundo fica inerte, o foco não escapa do painel e o Esc é tratado pelo
 * navegador. Ao abrir, o foco vai para o título; ao fechar, volta para quem abriu. Trava a rolagem
 * do corpo enquanto está aberto. É o único componente do sistema com sombra.
 *
 * Todo fechamento passa pelo evento `close` do `<dialog>`, que é onde o foco volta e a rolagem é
 * destravada. Serve para confirmar remoção. Apagar a conta usa tela própria com confirmação por
 * senha, não um sheet. Não há diálogo central no catálogo.
 *
 * @example
 * ```tsx
 * const sheetRef = useRef<BottomSheetHandle>(null)
 *
 * <Button variant="tertiary" onClick={() => sheetRef.current?.open()}>Remover</Button>
 * <BottomSheet
 *   ref={sheetRef}
 *   title="Remover esta atividade?"
 *   description="A palestra sai do seu total e o comprovante é apagado. Para corrigir um dado, remova e registre de novo."
 *   actions={
 *     <>
 *       <Button variant="danger" block onClick={remove}>Remover atividade</Button>
 *       <Button variant="secondary" block onClick={() => sheetRef.current?.close()}>Manter</Button>
 *     </>
 *   }
 * />
 * ```
 */
export function BottomSheet({
  ref,
  title,
  description,
  actions,
  returnFocusRef,
  onClose,
}: BottomSheetProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  // Quem tinha o foco ao abrir, e o `overflow` do corpo antes da trava. `null` = sem trava ativa.
  const openerRef = useRef<HTMLElement | null>(null)
  const previousOverflowRef = useRef<string | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  const releaseScroll = useCallback((): void => {
    if (previousOverflowRef.current === null) return

    document.body.style.overflow = previousOverflowRef.current
    previousOverflowRef.current = null
  }, [])

  // Callback ref estável: se a tela desmontar com o sheet aberto, a rolagem não fica travada.
  const attachDialog = useCallback(
    (node: HTMLDialogElement | null) => {
      dialogRef.current = node

      return () => {
        dialogRef.current = null
        releaseScroll()
      }
    },
    [releaseScroll],
  )

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        const dialog = dialogRef.current

        if (!dialog || dialog.open) return

        // Guardado antes do `showModal()`, que move o foco para dentro do painel.
        openerRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
        previousOverflowRef.current = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        dialog.showModal()
        titleRef.current?.focus()
      },
      close: () => {
        dialogRef.current?.close()
      },
    }),
    [],
  )

  return (
    <S.Dialog
      ref={attachDialog}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={() => {
        releaseScroll()
        ;(returnFocusRef?.current ?? openerRef.current)?.focus()
        openerRef.current = null
        onClose?.()
      }}
      onClick={(event) => {
        // O `dialog` não tem caixa própria, então só o véu cai aqui.
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <S.Panel>
        <S.Grip aria-hidden="true" />
        <S.Title id={titleId} ref={titleRef} tabIndex={-1}>
          {title}
        </S.Title>
        <S.Description id={descriptionId}>{description}</S.Description>
        <S.Actions>{actions}</S.Actions>
      </S.Panel>
    </S.Dialog>
  )
}
