import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen } from '@design-system'

import { ACCOUNT_DELETION_DEADLINE_DAYS } from '@/constants/privacy'

/**
 * Tela Conta apagada: confirma que a conta saiu e diz até quando os arquivos somem dos sistemas.
 *
 * @remarks
 * Fica fora dos grupos com `SessionGate`, porque a sessão já acabou: um grupo privado mandaria a
 * pessoa para Entrar antes de ela ler a confirmação. Quem apaga limpa o cache (RNF04) antes de
 * chegar aqui. Nada na tela depende de dado do aluno, então ela abre sem busca.
 *
 * O prazo vem do RNF05 (ADR 0017). A tela não promete e-mail de confirmação: `deleteAccount` não
 * envia nada e o SMTP de produção ainda não foi definido.
 *
 * @example
 * ```tsx
 * <ContaApagada />
 * ```
 */
export function ContaApagada(): ReactNode {
  return (
    <AppFrame>
      <StateScreen
        variant="success"
        title="Sua conta foi apagada"
        description={`As atividades e os comprovantes saem de todos os sistemas, inclusive das cópias de segurança, em até ${ACCOUNT_DELETION_DEADLINE_DAYS} dias.`}
        actions={
          <Button as={NextLink} href="/entrar" variant="secondary" block>
            Voltar ao início
          </Button>
        }
      />
    </AppFrame>
  )
}
