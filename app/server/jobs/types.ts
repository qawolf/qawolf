export const JOB_TYPES = [
  "checkPending",
  "deleteRunners",
  "deployRunners",
  "orchestrateGroups",
  "orchestrateRunners",
  "restartRunners",
] as const;

export type Job = typeof JOB_TYPES[number];
