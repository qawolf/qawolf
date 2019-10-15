import { BrowserStep, Job, Action } from "@qawolf/types";
import { readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";

const testTemplate = compile(
  readFileSync(resolve(__dirname, "../static/test.hbs"), "utf8")
);

export const formatIt = (step: BrowserStep): string => {
  if (step.action === "scroll") {
    return `can scroll ${step.scrollDirection!}`;
  }

  const stepValue = step.value ? ` into` : "";

  const targetTagName = `${
    step.target.tagName === "a" ? "link" : step.target.tagName || ""
  }`;

  const label = step.target.labels ? step.target.labels[0] : "";

  const targetName =
    label ||
    step.target.name ||
    step.target.placeholder ||
    step.target.textContent ||
    step.target.id ||
    "";
  const truncatedTargetName = targetName.trim().substring(0, 20); // ensure not too long

  return `can ${step.action}${stepValue} ${truncatedTargetName} ${targetTagName}`;
};

export const formatMethod = (action: Action, index: number): string => {
  const stepParam = `steps[${index}]`;

  if (action === "click") {
    return `click(${stepParam})`;
  }

  if (action === "input") {
    return `input(${stepParam}, values[${index}])`;
  }

  if (action === "scroll") {
    return `scroll(${stepParam})`;
  }

  throw new Error(`Invalid step action ${action}`);
};

export const formatStep = (step: BrowserStep) => {
  return {
    it: formatIt(step),
    method: formatMethod(step.action, step.index)
  };
};

export const buildTest = (job: Job) => {
  const test = testTemplate({
    name: job.name,
    steps: job.steps.map(step => formatStep(step))
  });

  return test;
};
