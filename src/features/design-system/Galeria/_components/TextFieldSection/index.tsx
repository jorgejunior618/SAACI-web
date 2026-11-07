import type { ReactNode } from 'react'

import { TextField } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "TextField" da galeria: os quatro estados, a senha e a área de teste. */
export function TextFieldSection(): ReactNode {
  return (
    <Section
      title="TextField"
      description="Campo de texto com o rótulo sempre visível e a regra escrita abaixo dele, nunca no placeholder. O erro fica entre o rótulo e o campo. Senha é este mesmo componente."
    >
      <S.Specimens>
        <Specimen label="normal · com regra">
          <S.Wide>
            <TextField
              label="Semestre de início"
              hint="Só contam as atividades feitas a partir desse semestre."
              defaultValue="2023.1"
            />
          </S.Wide>
        </Specimen>
        <Specimen label='type="password" · Mostrar/Ocultar'>
          <S.Wide>
            <TextField label="Senha" type="password" defaultValue="senhaforte" />
          </S.Wide>
        </Specimen>
        <Specimen label="error · próximo passo na mensagem">
          <S.Wide>
            <TextField
              label="E-mail de aluno"
              type="email"
              error="Use o seu e-mail de aluno do IFCE, que termina em @aluno.ifce.edu.br"
              defaultValue="maria@gmail.com"
            />
          </S.Wide>
        </Specimen>
        <Specimen label='status="read" · lido do certificado'>
          <S.Wide>
            <TextField
              label="Nome da atividade"
              status="read"
              defaultValue="Semana de Engenharia de Computação 2025"
            />
          </S.Wide>
        </Specimen>
        <Specimen label='status="unread" · a leitura não achou'>
          <S.Wide>
            <TextField
              label="Data em que a atividade terminou"
              status="unread"
              unreadMessage="Não conseguimos ler a data. Digite a data em que a atividade terminou."
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
            />
          </S.Wide>
        </Specimen>
        <Specimen label="optional · (opcional) no rótulo">
          <S.Wide>
            <TextField label="Observação" optional />
          </S.Wide>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
