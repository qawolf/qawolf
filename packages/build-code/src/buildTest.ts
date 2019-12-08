import { Workflow } from "@qawolf/types";
import { readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";
import { formatStep } from "./formatStep";

const testTemplate = compile(
  readFileSync(resolve(__dirname, "../static/test.hbs"), "utf8")
);

export const buildTest = (workflow: Workflow) => {
  const test = testTemplate({
    name: workflow.name,
    steps: workflow.steps.map(step => formatStep(step)),
    url: workflow.url
  });

  return test;
};
