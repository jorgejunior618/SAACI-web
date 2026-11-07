/**
 * Cria um `File` com o tamanho que a galeria quer mostrar, sem carregar o conteúdo.
 *
 * @param name Nome do arquivo.
 * @param sizeBytes Tamanho informado em bytes.
 * @returns Um `File` de amostra.
 */
export function fakeFile(name: string, sizeBytes: number): File {
  const file = new File(['x'], name, { type: 'application/pdf' })

  Object.defineProperty(file, 'size', { value: sizeBytes })

  return file
}
