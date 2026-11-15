'use client'

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen } from '@design-system'

/**
 * Tela Conta apagada: confirma que a conta saiu e diz até quando os arquivos somem dos sistemas.
 *
 * @remarks
 * Fica fora dos grupos com `SessionGate`, porque a sessão já acabou: um grupo privado mandaria a
 * pessoa para Entrar antes de ela ler a confirmação. Quem apaga limpa o cache (RNF04) antes de
 * chegar aqui. Nada na tela depende de dado do aluno, então ela abre sem busca.
 *
 * TODO: o prazo vem do RNF05 e o e-mail de confirmação da exclusão ainda não existe no service
 * (`deleteAccount` não envia nada). Os dois aparecem como marcador até a equipe definir.
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
        description="As atividades e os comprovantes saem de todos os sistemas, inclusive das cópias de segurança, em até [PRAZO DO RNF05]. Mandamos uma confirmação para o seu e-mail [E-MAIL DE CONFIRMAÇÃO DA EXCLUSÃO]."
        actions={
          <Button as={NextLink} href="/entrar" variant="secondary" block>
            Voltar ao início
          </Button>
        }
      />
    </AppFrame>
  )
}
