import { Job } from "@qawolf/types";
import { upperCase } from "lodash";

export const getStepValues = (job: Job) => {
  /**
   * Use QAW_JOBNAME_STEPINDEX environment variable for step value if it is defined.
   * Ex. QAW_LOGIN_0=...
   */
  const values = job.steps.map((step, index) => {
    const key = `QAW_${upperCase(job.name)}_${index}`;

    const envValue = process.env[key];
    if (typeof envValue !== "undefined") {
      return envValue;
    }

    return step.value;
  });

  return values;
};
