import type { Activity } from '@/services/activities'

/**
 * Indica se o comprovante da atividade conta no total, inteiro ou em parte.
 *
 * @param activity Atividade com o `status` do cálculo único.
 * @returns `true` para `conta` e `parcial`.
 */
export function isCounting(activity: Activity): boolean {
  return activity.status !== 'nao_conta'
}
