import type { LeituraComprovante } from './atividades.types'

// Arquivo original escolhido nesta aba. Entre recargas, só a cópia reduzida continua.
export const arquivosDaSessao = new Map<string, File>()

const contem = (texto: string, ...palavras: string[]): boolean =>
  palavras.some((palavra) => texto.includes(palavra))

const semExtensao = (nome: string): string => nome.replace(/\.[^.]+$/, '')

function tituloDoArquivo(nomeArquivo: string): string {
  const texto = semExtensao(nomeArquivo)
    .replace(/^(certificado|declaracao|comprovante)[-_ ]*/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()

  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : 'Atividade'
}

// Imita a leitura por IA: sugere o item pelo nome do arquivo. "ilegivel" no nome simula falha.
export function lerComprovanteMock(arquivo: File): LeituraComprovante {
  const nome = semExtensao(arquivo.name).toLowerCase()
  const dataFim = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  if (contem(nome, 'ilegivel')) {
    return { itemSugerido: 7, nome: tituloDoArquivo(arquivo.name), quantidade: null, dataFim: null }
  }
  if (contem(nome, 'palestra')) {
    return { itemSugerido: 13, nome: tituloDoArquivo(arquivo.name), quantidade: 3, dataFim }
  }
  if (contem(nome, 'semana', 'evento', 'hackathon', 'congresso')) {
    return { itemSugerido: 12, nome: tituloDoArquivo(arquivo.name), quantidade: 2, dataFim }
  }
  if (contem(nome, 'ingles', 'espanhol', 'idioma', 'lingua')) {
    return { itemSugerido: 6, nome: tituloDoArquivo(arquivo.name), quantidade: 40, dataFim }
  }

  return { itemSugerido: 7, nome: tituloDoArquivo(arquivo.name), quantidade: 40, dataFim }
}
