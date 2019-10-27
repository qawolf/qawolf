import { Workflow } from "@qawolf/types";

export const getUrl = (workflow: Workflow) => {
  /**
   * Use QAW_WORKFLOWNAME_URL environment variable if it is defined. Ex. QAW_LOGIN_URL=...
   * Otherwise use QAW_URL environment variable if it is defined.
   * Otherwise use the original workflow url.
   */
  const key = `QAW_${workflow.name.toUpperCase()}_URL`;

  const workflowUrlValue = process.env[key];
  if (typeof workflowUrlValue !== "undefined") {
    return workflowUrlValue;
  }

  const globalUrlValue = process.env.QAW_URL;
  if (typeof globalUrlValue !== "undefined") {
    return globalUrlValue;
  }

  return workflow.url;
};
