export const JOB_TYPES = [
  "checkPending",
  "deleteOldEmails",
  "deleteRunners",
  "deployRunners",
  "orchestrateRunners",
  "orchestrateTriggers",
  "restartRunners",
  "updateSegmentTeams",
] as const;

export type Job = typeof JOB_TYPES[number];
