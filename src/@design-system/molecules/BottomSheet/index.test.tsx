// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { BottomSheet } from './index'
import type { BottomSheetHandle } from './index'

type HarnessProps = {
  /** Faz o foco voltar a outro elemento que não o gatilho. */
  useReturnRef?: boolean
  onClose?: () => void
}

// A tela de verdade: um botão abre o sheet e "Manter" fecha, os dois pelo `ref`.
function Harness({ useReturnRef = false, onClose }: HarnessProps): ReactNode {
  const sheetRef = useRef<BottomSheetHandle>(null)
  const otherRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button type="button" onClick={() => sheetRef.current?.open()}>
        Remover
      </button>
      <button type="button" ref={otherRef}>
        Outro botão
      </button>
      <BottomSheet
        ref={sheetRef}
        title="Remover esta atividade?"
        description="A palestra sai do seu total e o comprovante é apagado."
        returnFocusRef={useReturnRef ? otherRef : undefined}
        onClose={onClose}
        actions={
          <>
            <button type="button">Remover atividade</button>
            <button type="button" onClick={() => sheetRef.current?.close()}>
              Manter
            </button>
          </>
        }
      />
    </>
  )
}

function getDialog(): HTMLDialogElement {
  const dialog = document.querySelector('dialog')

  if (!dialog) throw new Error('dialog não encontrado')

  return dialog
}

describe('BottomSheet', () => {
  it('começa fechado', () => {
    render(<Harness />)

    expect(getDialog()).not.toHaveAttribute('open')
  })

  it('abre como modal nomeado pelo título, com foco no título', async () => {
    const user = userEvent.setup()

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Remover' }))

    const dialog = screen.getByRole('dialog', { name: 'Remover esta atividade?' })

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription(
      'A palestra sai do seu total e o comprovante é apagado.',
    )
    expect(screen.getByRole('heading', { name: 'Remover esta atividade?' })).toHaveFocus()
  })

  it('Esc fecha, devolve o foco e avisa o onClose uma vez', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Harness onClose={onClose} />)

    const trigger = screen.getByRole('button', { name: 'Remover' })

    await user.click(trigger)
    fireEvent(getDialog(), new Event('cancel', { cancelable: true }))

    expect(getDialog()).not.toHaveAttribute('open')
    expect(trigger).toHaveFocus()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('toque no véu fecha, mas toque no painel não', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Harness onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Remover' }))
    await user.click(screen.getByRole('heading', { name: 'Remover esta atividade?' }))

    expect(getDialog()).toHaveAttribute('open')
    expect(onClose).not.toHaveBeenCalled()

    await user.click(getDialog())

    expect(getDialog()).not.toHaveAttribute('open')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ao fechar pelo ref, o foco volta ao botão que abriu', async () => {
    const user = userEvent.setup()

    render(<Harness />)

    const trigger = screen.getByRole('button', { name: 'Remover' })

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Manter' }))

    expect(getDialog()).not.toHaveAttribute('open')
    expect(trigger).toHaveFocus()
  })

  it('com returnFocusRef, o foco volta para onde a tela mandou', async () => {
    const user = userEvent.setup()

    render(<Harness useReturnRef />)
    await user.click(screen.getByRole('button', { name: 'Remover' }))
    await user.click(screen.getByRole('button', { name: 'Manter' }))

    expect(screen.getByRole('button', { name: 'Outro botão' })).toHaveFocus()
  })

  it('trava a rolagem do corpo enquanto aberto e a devolve ao fechar', async () => {
    const user = userEvent.setup()

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Remover' }))

    expect(document.body.style.overflow).toBe('hidden')

    await user.click(screen.getByRole('button', { name: 'Manter' }))

    expect(document.body.style.overflow).toBe('')
  })

  it('abrir de novo com o sheet aberto não perde o elemento que abriu', async () => {
    const user = userEvent.setup()

    render(<Harness />)

    const trigger = screen.getByRole('button', { name: 'Remover' })

    await user.click(trigger)
    // O sheet é modal no navegador; aqui chamamos o `open()` de novo direto pelo botão.
    fireEvent.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Manter' }))

    expect(document.body.style.overflow).toBe('')
    expect(trigger).toHaveFocus()
  })

  it('desmontar com o sheet aberto destrava a rolagem', async () => {
    const user = userEvent.setup()

    function Screen(): ReactNode {
      const [isMounted, setIsMounted] = useState(true)

      return (
        <>
          <button type="button" onClick={() => setIsMounted(false)}>
            Sair
          </button>
          {isMounted ? <Harness /> : null}
        </>
      )
    }

    render(<Screen />)
    await user.click(screen.getByRole('button', { name: 'Remover' }))

    expect(document.body.style.overflow).toBe('hidden')

    // O `dialog` real deixaria o resto inerte; no jsdom o botão "Sair" continua alcançável.
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(document.body.style.overflow).toBe('')
  })
})
