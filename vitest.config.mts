import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    globals: true,
    // O esqueleto ainda não tem testes; o primeiro entra com a primeira regra.
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/*.test.ts'],
    env: {
      // O fuso é parte do teste, não conveniência. Em BRT, o relógio de quem desenvolve, uma função
      // de data que esquecesse o `timeZone` passaria por acidente. Em UTC a diferença aparece, e um
      // teste que só falha na máquina de outra pessoa não protege nada (importa em projeto aberto).
      TZ: 'UTC',
    },
  },
})
