import { Step } from "@qawolf/types";
import { formatIt } from "./formatIt";
import { formatMethod } from "./formatMethod";

type BuildStepsOptions = {
  isTest?: boolean;
  steps: Step[];
  startIndex: number;
};

export const buildTestStep = (it: string, method: string) => {
  const testCode = `it('can ${it}', async () => {
  ${method}
});\n\n`;

  return testCode;
};

export const buildScriptStep = (it: string, method: string) => {
  const code = `// ${it}
${method}\n`;

  return code;
};

export const buildStepsCode = ({
  startIndex,
  steps,
  isTest
}: BuildStepsOptions) => {
  let stepsCode = "";

  for (let i = startIndex; i < steps.length; i++) {
    const previousStep = i > 0 ? steps[i - 1] : null;
    const step = steps[i];

    const it = formatIt(step);
    const method = formatMethod(step, previousStep);

    stepsCode += isTest
      ? buildTestStep(it, method)
      : buildScriptStep(it, method);
  }

  return stepsCode;
};
