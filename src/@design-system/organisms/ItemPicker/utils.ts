// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/** O que o filtro lê de cada item: o nome e a regra, os dois textos que o aluno reconhece. */
export type SearchableItem = {
  name: string
  rule: string
}

/**
 * Deixa um texto comparável: sem acento, sem maiúscula e sem espaço nas pontas.
 *
 * @remarks
 * Separa cada letra do seu acento (`normalize('NFD')`) e apaga os acentos soltos, então "ç", "ã" e
 * "é" viram "c", "a" e "e". A caixa segue o português do Brasil.
 *
 * @param text Texto do item ou da busca.
 * @returns O texto normalizado.
 *
 * @example
 * ```ts
 * normalizeText('  Extensão ') // "extensao"
 * ```
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

/**
 * Filtra os itens pela busca, casando com o nome e com a regra, e mantém a ordem do formulário.
 *
 * @remarks
 * A busca é por palavra: cada palavra digitada precisa aparecer no nome ou na regra, em qualquer
 * ordem. "curso engenharia" acha "Curso na área de engenharia de computação". Sem acento e sem
 * diferença de maiúscula. Busca vazia devolve todos os itens.
 *
 * @param items Itens na ordem do formulário.
 * @param query Texto digitado na busca.
 * @returns Os itens que casam, na mesma ordem em que chegaram.
 *
 * @example
 * ```ts
 * filterItems(items, 'extensao') // acha "Projeto de extensão"
 * ```
 */
export function filterItems<T extends SearchableItem>(items: T[], query: string): T[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)

  if (words.length === 0) return items

  return items.filter((item) => {
    const text = normalizeText(`${item.name} ${item.rule}`)

    return words.every((word) => text.includes(word))
  })
}

/**
 * Escreve a frase de quando a busca não acha nada, dizendo o que tentar.
 *
 * @param query Texto digitado na busca.
 * @param suggestions Palavras que costumam dar resultado ("evento", "curso"). Sem elas, a frase só diz que nada foi achado.
 * @returns A frase, por exemplo `Nenhum item tem 'hackathon'. Tente 'evento' ou 'curso'.`
 */
export function describeEmpty(query: string, suggestions: string[] = []): string {
  const found = `Nenhum item tem '${query.trim()}'.`

  if (suggestions.length === 0) return found

  const options = new Intl.ListFormat('pt-BR', { style: 'long', type: 'disjunction' }).format(
    suggestions.map((word) => `'${word}'`),
  )

  return `${found} Tente ${options}.`
}
