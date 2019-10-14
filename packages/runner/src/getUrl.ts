import { Job } from "@qawolf/types";
import { upperCase } from "lodash";

export const getUrl = (job: Job) => {
  /**
   * Use QAW_JOBNAME_URL environment variable if it is defined.
   * EX. QAW_LOGIN_URL=...
   */
  const key = `QAW_${upperCase(job.name)}_URL`;

  const envValue = process.env[key];
  if (typeof envValue !== "undefined") {
    return envValue;
  }

  return job.url;
};
