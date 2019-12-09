import { Step } from "@qawolf/types";
import { formatIt } from "./formatIt";
import { formatMethod } from "./formatMethod";

export const formatStep = (step: Step) => {
  return {
    it: formatIt(step),
    method: formatMethod(step.action, step.index, step.value)
  };
};
