// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/**
 * Entrega um arquivo gerado no navegador como download.
 *
 * @remarks
 * O endereço do `Blob` é liberado só depois de um minuto, para o navegador ter tempo de começar a
 * gravar, inclusive no Safari. Não é puro: mexe no DOM, mas não usa rede.
 *
 * @param file O conteúdo do arquivo.
 * @param name Nome com que o arquivo cai nos downloads, extensão incluída.
 *
 * @example
 * ```ts
 * saveFile(new Blob(['%PDF'], { type: 'application/pdf' }), 'formulario.pdf')
 * ```
 */
export function saveFile(file: Blob, name: string): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
