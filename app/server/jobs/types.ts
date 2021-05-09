export const JOB_TYPES = [
  "deleteOldEmails",
  "orchestrateTriggers",
  "runPendingJob",
  "syncTeams",
] as const;

export type Job = typeof JOB_TYPES[number];
