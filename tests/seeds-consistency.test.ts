import { describe, expect, it } from 'vitest'

import { getActivities } from '@/services/activities'
import { getProgress } from '@/services/progress'

describe('mocks dos domínios', () => {
  it('as atividades de exemplo somam o mesmo total do progresso de exemplo', async () => {
    const [activities, progresso] = await Promise.all([getActivities(), getProgress()])

    expect(activities.length).toBeGreaterThan(0)
    expect(activities.reduce((sum, a) => sum + a.countedHours, 0)).toBe(progresso.totalHours)
  })
})
