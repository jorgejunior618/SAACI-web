import { FileCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { ButtonLink, Card, Disclosure, FileRow, InlineMessage, StateScreen } from '@design-system'

import { ROUTES } from '@/constants/routes'
import type { FormularioGerado } from '@/services/formulario'
import { formatDataHora } from '@/utils/datas'
import { formatTamanho } from '@/utils/formatTamanho'

import * as S from './styles'

type Props = {
  gerado: FormularioGerado
  comprovantes: number
}

export function Baixado({ gerado, comprovantes }: Props): ReactNode {
  return (
    <>
      <StateScreen icon={FileCheck} iconTone="brand" title="Formulário baixado" headingLevel="h1">
        <p>Gerado em {formatDataHora(new Date(gerado.geradoEm))}.</p>
      </StateScreen>
      <FileRow name={gerado.arquivo} size={formatTamanho(gerado.tamanhoBytes)} />
      <InlineMessage>
        Nesta versão o PDF ainda é simulado e não chega aos downloads do celular.
      </InlineMessage>

      <Card aria-label="Próximo passo">
        <S.Caption>Próximo passo</S.Caption>
        <S.Title>Entregar na coordenação</S.Title>
        <S.Text>
          Leve o formulário e os {comprovantes} comprovantes que contam pelo SEI ou no protocolo. O
          SAACI mostra o passo a passo.
        </S.Text>
        <S.Actions>
          <Disclosure summary="Ver como entregar">
            <S.Text>
              [PASSO A PASSO DE ENTREGA DO RF37, A CONFIRMAR COM A COORDENAÇÃO: tipo de processo no
              SEI e endereço do protocolo]
            </S.Text>
          </Disclosure>
          <ButtonLink href={ROUTES.atividades} variant="secondary" isBlock>
            Baixar os comprovantes que contam
          </ButtonLink>
        </S.Actions>
      </Card>
    </>
  )
}
