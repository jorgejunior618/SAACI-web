import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, TopBar } from '@design-system'

import { ACCOUNT_DELETION_DEADLINE_DAYS } from '@/constants/privacy'

import * as S from './styles'

/**
 * Tela Aviso de privacidade: o que o SAACI guarda do aluno, com quem passa e por quanto tempo.
 *
 * @remarks
 * Texto básico, em linguagem simples, fixo no código. Cita os serviços de terceiros que o sistema
 * usa: Supabase (conta, atividades e arquivos), Vercel (hospedagem), Brevo (envio dos e-mails de
 * confirmação e de nova senha, ADR 0019) e Google Gemini (só na leitura automática do comprovante,
 * ADR 0016, aprovada pelo time). Trocar ou incluir um serviço pede mudar a lista aqui. O prazo de
 * exclusão vem de `ACCOUNT_DELETION_DEADLINE_DAYS` (ADR 0017). Abre a partir do Perfil, então o
 * Voltar leva para lá.
 *
 * @example
 * ```tsx
 * <AvisoDePrivacidade />
 * ```
 */
export function AvisoDePrivacidade(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Aviso de privacidade" backHref="/perfil" linkAs={NextLink} />
      }
    >
      <S.Page>
        <S.Title>Como cuidamos dos seus dados</S.Title>

        <S.Section>
          <S.Heading>O que guardamos</S.Heading>
          <S.Text>
            Seu e-mail do IFCE, seu curso, as atividades que você registra e os comprovantes que
            você envia. Usamos isso só para somar suas horas e montar o seu pedido.
          </S.Text>
        </S.Section>

        <S.Section>
          <S.Heading>Com quem os dados passam</S.Heading>
          <S.Text>Usamos quatro serviços de terceiros:</S.Text>
          <S.List>
            <li>Supabase: guarda sua conta, suas atividades e seus comprovantes.</li>
            <li>Vercel: mantém o site no ar. Seus acessos passam pelos servidores dela.</li>
            <li>
              Brevo: envia os e-mails de confirmação da conta e de nova senha para o seu e-mail do
              IFCE.
            </li>
            <li>
              Google (Gemini): recebe o comprovante só quando você pede a leitura automática, para
              ler os dados do arquivo. Na versão gratuita, o Google pode usar o conteúdo enviado
              para melhorar os produtos dele.
            </li>
          </S.List>
          <S.Text>Não vendemos seus dados.</S.Text>
        </S.Section>

        <S.Section>
          <S.Heading>Por quanto tempo guardamos</S.Heading>
          <S.Text>
            Enquanto a sua conta existir. Quando você apaga a conta, as atividades e os comprovantes
            saem de todos os sistemas, inclusive das cópias de segurança, em até{' '}
            {ACCOUNT_DELETION_DEADLINE_DAYS} dias.
          </S.Text>
        </S.Section>

        <S.Section>
          <S.Heading>Como apagar seus dados</S.Heading>
          <S.Text>
            Você pode apagar a conta quando quiser, em{' '}
            <S.TextLink as={NextLink} href="/excluir-conta">
              Excluir conta
            </S.TextLink>
            . Antes, baixe os comprovantes que quiser guardar.
          </S.Text>
        </S.Section>
      </S.Page>
    </AppFrame>
  )
}
