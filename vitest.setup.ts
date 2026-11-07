import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// O jsdom 30 tem o `HTMLDialogElement`, mas sem `showModal` e `close`. Estes stubs imitam o que o
// navegador faz com o atributo `open`, o evento `close` e o Esc (`cancel` sem `preventDefault`
// fecha). Foco preso e fundo inerte são do navegador e não são testados aqui.
const listeningToCancel = new WeakSet<HTMLDialogElement>()

if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.setAttribute('open', '')

    if (listeningToCancel.has(this)) return

    listeningToCancel.add(this)
    this.addEventListener('cancel', (event) => {
      if (!event.defaultPrevented) this.close()
    })
  }
}

if (typeof HTMLDialogElement.prototype.close !== 'function') {
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) return

    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

afterEach(cleanup)
