import { ClipboardList } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button, LoadingState, StateScreen } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "StateScreen" da galeria: as quatro variantes, o selo, o `LoadingState` e a área de teste. */
export function StateScreenSection(): ReactNode {
  return (
    <Section
      title="StateScreen"
      description="Tela inteira para vazio, sucesso, erro de conexão e carregando. A arte é um ícone de 28px num círculo de 56px; o vazio escolhe o ícone, e o selo acima do título é opcional. O texto de erro diz que nada foi perdido e o próximo passo."
    >
      <S.Specimens>
        <Specimen label='variant="empty"'>
          <StateScreen
            variant="empty"
            icon={ClipboardList}
            title="Você precisa de 120h para se formar"
            description="Registre a primeira atividade quando quiser. A gente mostra quanto ela vale antes de você enviar."
            actions={<Button block>Registrar atividade</Button>}
          />
        </Specimen>
        <Specimen label="eyebrow · selo acima do título">
          <StateScreen
            variant="empty"
            icon={ClipboardList}
            eyebrow="Em construção"
            title="Eventos está chegando"
            description="Em breve você vai ver aqui palestras, cursos e eventos que contam horas."
          />
        </Specimen>
        <Specimen label='variant="success"'>
          <StateScreen
            variant="success"
            title="Atividade registrada"
            description="Ela contou 4,0h. Faltam 43h para completar suas horas."
            actions={
              <>
                <Button block>Registrar outra</Button>
                <Button variant="secondary" block>
                  Ver meu progresso
                </Button>
              </>
            }
          />
        </Specimen>
        <Specimen label='variant="connectionError"'>
          <StateScreen
            variant="connectionError"
            title="Não conseguimos carregar seu painel"
            description="Suas atividades continuam salvas. Confira sua internet e tente de novo."
            actions={
              <Button variant="secondary" block>
                Tentar de novo
              </Button>
            }
          />
        </Specimen>
        <Specimen label="LoadingState">
          <LoadingState label="Calculando suas horas" />
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
