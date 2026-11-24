// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

export { CourseLockedError } from './profile.errors'
export { getProfile } from './profile.api'
export { profileKeys } from './profile.keys'
export { invalidateAfterProfileWrite, updateProfile } from './profile.mutations'
export { profileQueries } from './profile.queries'
export { ProfileSchema, StartSemesterSchema, UpdateProfileSchema } from './profile.types'
export type { Profile, UpdateProfile } from './profile.types'
