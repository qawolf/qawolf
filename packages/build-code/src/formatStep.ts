import { Step } from "@qawolf/types";
import { formatIt } from "./formatIt";
import { formatMethod } from "./formatMethod";

export const formatStep = (step: Step, previousStep?: Step | null) => {
  return {
    it: formatIt(step),
    method: formatMethod(step, previousStep)
  };
};
