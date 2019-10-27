import { Action, BrowserStep, Workflow } from "@qawolf/types";
import { readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";

const testTemplate = compile(
  readFileSync(resolve(__dirname, "../static/test.hbs"), "utf8")
);

export const formatIt = (step: BrowserStep): string => {
  if (step.action === "scroll") {
    return `can scroll`;
  }

  const stepValue = step.value ? ` into` : "";

  const targetTagName = `${
    step.target.tagName === "a" ? "link" : step.target.tagName || ""
  }`;

  const label = step.target.labels ? step.target.labels.join(" ") : "";

  const targetName =
    label ||
    step.target.name ||
    step.target.placeholder ||
    step.target.textContent ||
    step.target.id ||
    "";
  let truncatedTargetName = targetName.trim();
  if (truncatedTargetName.length > 40) {
    truncatedTargetName = `${truncatedTargetName.substring(0, 40)}...`;
  }

  return `can ${step.action}${stepValue} "${truncatedTargetName}" ${targetTagName}`;
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
    return `scrollElement(${stepParam}, values[${index}])`;
  }

  throw new Error(`Invalid step action ${action}`);
};

export const formatStep = (step: BrowserStep) => {
  return {
    it: formatIt(step),
    method: formatMethod(step.action, step.index)
  };
};

export const buildTest = (workflow: Workflow) => {
  const test = testTemplate({
    name: workflow.name,
    steps: workflow.steps.map(step => formatStep(step))
  });

  return test;
};
