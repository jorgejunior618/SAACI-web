'use client'

import { type ReactNode, useEffect, useId, useRef } from 'react'

import * as S from './styles'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  // Destrutivo primeiro, depois a alternativa segura ("Manter").
  actions: ReactNode
}

export function ConfirmSheet({ isOpen, onClose, title, children, actions }: Props): ReactNode {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={ref}
      className={S.dialog}
      aria-labelledby={titleId}
      aria-modal="true"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <S.Grip aria-hidden />
      <S.Title id={titleId}>{title}</S.Title>
      <S.Body>{children}</S.Body>
      <S.Actions>{actions}</S.Actions>
    </dialog>
  )
}
