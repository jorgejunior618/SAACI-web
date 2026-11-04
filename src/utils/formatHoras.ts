// Valor calculado: uma casa decimal, vírgula, sem espaço antes do h ("10,0h").
export function formatHoras(horas: number): string {
  return `${horas.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h`
}

// Total e meta: horas inteiras ("61h").
export function formatHorasInteiras(horas: number): string {
  return `${Math.floor(horas + 1e-9).toLocaleString('pt-BR')}h`
}
