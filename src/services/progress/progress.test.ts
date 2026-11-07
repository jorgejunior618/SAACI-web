import { describe, expect, it } from 'vitest'

import { getProgress } from './progress.api'

describe('progress', () => {
  it('mantém faltam igual à meta menos o total', async () => {
    const progress = await getProgress()

    expect(progress.categories.length).toBeGreaterThan(0)
    expect(progress.missingHours).toBe(progress.targetHours - progress.totalHours)
    expect(progress.categories.reduce((sum, c) => sum + c.countedHours, 0)).toBe(progress.itemsSum)
  })
})
