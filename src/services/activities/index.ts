// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

export { getActivity, getActivities, getProofFile, getProofUrl, readProof } from './activities.api'
export {
  StaleActivityError,
  ActivityNotFoundError,
  InvalidActivityDatesError,
  InvalidActivityItemError,
  ProofDownloadError,
  UnreadableProofError,
} from './activities.errors'
export { activitiesKeys } from './activities.keys'
export {
  createActivity,
  invalidateAfterActivityRemoval,
  invalidateAfterActivityWrite,
  removeActivity,
  updateActivity,
} from './activities.mutations'
export { activitiesQueries } from './activities.queries'
export {
  ActivitySchema,
  END_BEFORE_START_MESSAGE,
  PROOF_MAX_BYTES,
  PROOF_MIME_TYPES,
  ProofSchema,
  ActivityCorrectionSchema,
  NewActivitySchema,
  ActivityStatusSchema,
  ProofSuggestionSchema,
} from './activities.types'
export type {
  Activity,
  Proof,
  ActivityCorrection,
  NewActivity,
  ActivityStatus,
  ProofSuggestion,
} from './activities.types'
