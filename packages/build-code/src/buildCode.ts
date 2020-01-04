import { Workflow } from "@qawolf/types";
import { readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { camelCase } from "lodash";
import { resolve } from "path";
import { formatLaunch } from "./formatLaunch";
import { formatStep } from "./formatStep";

type BuildCodeOptions = {
  test?: boolean;
  workflow: Workflow;
};

const scriptTemplate = compile(
  readFileSync(resolve(__dirname, "../static/script.hbs"), "utf8")
);

const testTemplate = compile(
  readFileSync(resolve(__dirname, "../static/test.hbs"), "utf8")
);

export const buildCode = (options: BuildCodeOptions) => {
  const { workflow } = options;

  const template = options.test ? testTemplate : scriptTemplate;

  const code = template({
    launch: formatLaunch(workflow.url, workflow.device),
    name: camelCase(workflow.name),
    steps: workflow.steps.map((step, i) => {
      const previousStep = i > 0 ? workflow.steps[i - 1] : null;

      return formatStep(step, previousStep);
    }),
    url: workflow.url
  });

  return code;
};
