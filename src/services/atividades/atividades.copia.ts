// Cópia reduzida do comprovante para guardar no navegador sem gastar o espaço do localStorage
// (cerca de 5 MB no total). Foto vira JPEG menor; PDF não é copiado, porque reduzir PDF exigiria
// uma biblioteca e cortar o arquivo o deixaria ilegível.

const TENTATIVAS = [
  { ladoMaximo: 1280, qualidade: 0.6 },
  { ladoMaximo: 960, qualidade: 0.5 },
  { ladoMaximo: 720, qualidade: 0.45 },
] as const

// Teto de cada cópia, em caracteres de data URL (cerca de 220 KB de imagem).
export const TAMANHO_MAXIMO_COPIA = 300_000

export async function reduzirComprovante(arquivo: File): Promise<string | null> {
  const isImagem = arquivo.type === 'image/jpeg' || arquivo.type === 'image/png'
  if (!isImagem || typeof createImageBitmap !== 'function') return null

  try {
    const bitmap = await createImageBitmap(arquivo)

    for (const { ladoMaximo, qualidade } of TENTATIVAS) {
      const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * escala)
      canvas.height = Math.round(bitmap.height * escala)

      const contexto = canvas.getContext('2d')
      if (!contexto) return null
      // Fundo branco: PNG com transparência ficaria preto no JPEG.
      contexto.fillStyle = '#ffffff'
      contexto.fillRect(0, 0, canvas.width, canvas.height)
      contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/jpeg', qualidade)
      if (dataUrl.length <= TAMANHO_MAXIMO_COPIA) {
        bitmap.close()
        return dataUrl
      }
    }

    bitmap.close()
    return null
  } catch {
    return null
  }
}

// Nome do arquivo baixado a partir da cópia: a cópia é sempre JPEG.
export function nomeDaCopia(nomeOriginal: string): string {
  return `${nomeOriginal.replace(/\.[^.]+$/, '')}-copia-reduzida.jpg`
}
