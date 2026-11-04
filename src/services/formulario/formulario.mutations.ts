import { simularLatencia } from '../_mock'
import { requireConta } from '../conta/conta.api'

export type FormularioGerado = {
  arquivo: string
  tamanhoBytes: number
  geradoEm: string
}

const slug = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(/\s+/)
    .filter((_, i, partes) => i === 0 || i === partes.length - 1)
    .join('-')

// Simula a geração do PDF. O arquivo de verdade entra junto com o backend ou com uma biblioteca.
export async function gerarFormulario(isEmBranco = false): Promise<FormularioGerado> {
  const conta = requireConta()
  await simularLatencia(1800)

  const sufixo = isEmBranco ? 'em-branco' : slug(conta.nome ?? conta.email.split('@')[0])
  return {
    arquivo: `formulario-atividades-complementares-${sufixo}.pdf`,
    tamanhoBytes: 180 * 1024,
    geradoEm: new Date().toISOString(),
  }
}
