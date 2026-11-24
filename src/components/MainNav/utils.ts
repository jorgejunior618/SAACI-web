// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/** Aba da barra inferior que a rota atual acende. */
export type MainTabId = 'inicio' | 'atividades' | 'eventos' | 'perfil'

const TAB_ROOTS: ReadonlyArray<readonly [MainTabId, string]> = [
  ['inicio', '/inicio'],
  ['atividades', '/atividades'],
  ['eventos', '/eventos'],
  ['perfil', '/perfil'],
]

/**
 * Descobre qual aba da barra inferior corresponde ao caminho da rota.
 *
 * @remarks
 * Detalhe da atividade e Formulário moram sob `/atividades`, então acendem Atividades: é a regra do
 * mapa do app ("dentro de Atividades"). Registrar não é aba e nunca é devolvido.
 *
 * @param pathname Caminho da rota atual, como `usePathname` devolve.
 * @returns O id da aba, ou `undefined` quando o caminho não é de nenhuma aba.
 */
export function getActiveTab(pathname: string): MainTabId | undefined {
  return TAB_ROOTS.find(([, root]) => pathname === root || pathname.startsWith(`${root}/`))?.[0]
}
