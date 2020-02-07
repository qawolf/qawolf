import { Step } from "@qawolf/types";
import { buildIt } from "./buildIt";
import { buildMethod } from "./buildMethod";

export type BuildStepsOptions = {
  isTest?: boolean;
  startIndex: number;
  steps: Step[];
};

export const buildTestStep = (it: string, method: string) => {
  const testCode = `\nit('can ${it}', async () => {
  ${method}
});\n`;

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

    const it = buildIt(step);
    const method = buildMethod(step, previousStep);

    stepsCode += isTest
      ? buildTestStep(it, method)
      : buildScriptStep(it, method);
  }

  return stepsCode;
};
