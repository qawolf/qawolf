import { Workflow } from "@qawolf/types";
import { upperCase } from "lodash";

export const getStepValues = (workflow: Workflow) => {
  /**
   * Use QAW_WORKFLOWNAME_STEPINDEX environment variable for step value if it is defined.
   * Ex. QAW_LOGIN_0=...
   */
  const values = workflow.steps.map((step, index) => {
    const key = `QAW_${upperCase(workflow.name)}_${index}`;

    const envValue = process.env[key];
    if (typeof envValue !== "undefined") {
      return envValue;
    }

    return step.value;
  });

  return values;
};
