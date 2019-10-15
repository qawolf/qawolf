import { Job } from "@qawolf/types";
import { upperCase } from "lodash";

export const getUrl = (job: Job) => {
  /**
   * Use QAW_JOBNAME_URL environment variable if it is defined. Ex. QAW_LOGIN_URL=...
   * Otherwise use QAW_URL environment variable if it is defined.
   * Otherwise use the original job url.
   */
  const key = `QAW_${upperCase(job.name)}_URL`;

  const jobUrlValue = process.env[key];
  if (typeof jobUrlValue !== "undefined") {
    return jobUrlValue;
  }

  const globalUrlValue = process.env.QAW_URL;
  if (typeof globalUrlValue !== "undefined") {
    return globalUrlValue;
  }

  return job.url;
};
