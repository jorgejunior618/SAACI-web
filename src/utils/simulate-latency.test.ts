import { afterEach, describe, expect, it, vi } from 'vitest'

import { simulateLatency } from './simulate-latency'

describe('simulateLatency', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('resolve na hora nos testes', async () => {
    vi.useFakeTimers()

    await expect(simulateLatency(1_000)).resolves.toBeUndefined()
  })

  it('espera o tempo fora dos testes', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.useFakeTimers()
    const done = vi.fn()

    void simulateLatency(300).then(done)
    await vi.advanceTimersByTimeAsync(299)
    expect(done).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(done).toHaveBeenCalledTimes(1)
  })
})
