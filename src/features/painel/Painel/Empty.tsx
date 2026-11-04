import type { ReactNode } from 'react'

import { ButtonLink, Card, Steps } from '@design-system'

import { ROUTES } from '@/constants/routes'
import { styled } from '@/styled-system/jsx'

const Current = styled('div', {
  base: { paddingBottom: '6' },
})

const Eyebrow = styled('p', {
  base: { margin: '0', textStyle: 'caption', color: 'brand.text' },
})

const Title = styled('p', {
  base: { margin: '1 0 0', textStyle: 'bodyStrong', fontSize: '18px' },
})

const Text = styled('p', {
  base: { margin: '1 0 4', textStyle: 'support', color: 'ink.muted' },
})

const SectionTitle = styled('h2', {
  base: { margin: '2 0 3', textStyle: 'title' },
})

// Primeiro acesso: o caminho até a meta, com o passo atual em destaque.
export function Empty({ meta }: { meta: number }): ReactNode {
  return (
    <section>
      <SectionTitle>Seu caminho até as {meta}h</SectionTitle>
      <Steps
        steps={[
          {
            description: 'Registre uma atividade',
            isCurrent: true,
            content: (
              <Current>
                <Card>
                  <Eyebrow>Você está aqui</Eyebrow>
                  <Title>Registre uma atividade</Title>
                  <Text>Tire uma foto do comprovante e o app sugere o item.</Text>
                  <ButtonLink href={ROUTES.novaAtividade} isBlock>
                    Registrar a primeira atividade
                  </ButtonLink>
                </Card>
              </Current>
            ),
          },
          {
            title: 'O SAACI calcula as horas',
            description: 'Pela regra do seu curso, e mostra quanto ainda cabe em cada item.',
          },
          {
            title: 'Você entrega o pedido',
            description: `Com ${meta}h, o formulário fica pronto e os certificados separados para a coordenação.`,
            isGoal: true,
          },
        ]}
      />
    </section>
  )
}
