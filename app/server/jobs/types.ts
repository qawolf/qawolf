export const JOB_TYPES = [
  "checkPending",
  "deleteRunners",
  "deployRunners",
  "orchestrateRunners",
  "orchestrateTriggers",
  "restartRunners",
] as const;

export type Job = typeof JOB_TYPES[number];
