import type { ReactNode } from 'react'

import { Link, Notice } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "Notice" da galeria: frase em linha, bloco, resumo de erros e a área de teste. */
export function NoticeSection(): ReactNode {
  return (
    <Section
      title="Notice"
      description="Aviso dentro da tela, com o que aconteceu e o que fazer a seguir. A frase em linha é a regra; o bloco serve quando há título ou ação. Um nível de ênfase por tela."
    >
      <S.Specimens>
        <Specimen label='format="inline" tone="warning"'>
          <Notice tone="warning">
            Palestras como ouvinte já chegaram ao limite de 30h. Novas palestras não somam mais
            horas.
          </Notice>
        </Specimen>
        <Specimen label='format="inline" tone="success"'>
          <Notice tone="success">
            Enviamos um novo link. Confira seu e-mail, inclusive o spam.
          </Notice>
        </Specimen>
        <Specimen label='format="block"'>
          <Notice format="block" title="As regras do curso foram atualizadas">
            Recalculamos seu total com a regra nova. Por isso o número mudou.
          </Notice>
        </Specimen>
        <Specimen label='format="block" tone="danger" actions'>
          <Notice
            format="block"
            tone="danger"
            title="O envio caiu no meio"
            actions={
              <Link as="button" type="button">
                Tentar de novo
              </Link>
            }
          >
            Nada foi registrado. O que você preencheu continua aqui.
          </Notice>
        </Specimen>
        <Specimen label="resumo de erros (tabIndex -1)">
          <Notice format="block" tone="danger" title="Falta corrigir 2 coisas" tabIndex={-1}>
            <ul>
              <li>
                <a href="#comprovante">Falta anexar o comprovante desta atividade</a>
              </li>
              <li>
                <a href="#data">Digite a data em que a atividade terminou</a>
              </li>
            </ul>
          </Notice>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
