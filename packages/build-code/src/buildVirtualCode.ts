import { Step } from "@qawolf/types";
import { AssertionExpression } from "./AssertionExpression";
import { ScriptExpression } from "./ScriptExpression";
import { StepExpression } from "./StepExpression";
import { VirtualCode } from "./VirtualCode";

export const buildVirtualCode = (steps: Step[], isTest: boolean = false) => {
  let previous: StepExpression;

  const expressions = steps.map(step => {
    const stepExpression = new StepExpression(step, previous);
    previous = stepExpression;

    if (isTest) {
      return new AssertionExpression(stepExpression);
    }

    return new ScriptExpression(stepExpression);
  });

  return new VirtualCode(expressions);
};
