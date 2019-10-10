import { readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";
import { BrowserStep, Job } from "../types";
import { cwd } from "process";

const testTemplate = compile(
  readFileSync(resolve(__dirname, "../../bin/test.template"), "utf8")
);

export const formatStep = (step: BrowserStep): string => {
  if (step.action === "scroll") {
    return `scroll ${step.scrollDirection!}`;
  }

  const stepAction = step.action === "input" ? "enter" : "click";
  const stepValue = step.value ? `"${step.value}" into ` : "";
  const targetTagName = step.target.inputType
    ? `${step.target.tagName}[type="${step.target.inputType}"]`
    : `${step.target.tagName === "a" ? "link" : step.target.tagName || ""}`;
  const label = step.target.labels ? step.target.labels[0] : "";

  const targetName =
    label ||
    step.target.name ||
    step.target.placeholder ||
    step.target.textContent ||
    step.target.id ||
    "";
  const truncatedTargetName = targetName.substring(0, 50); // ensure not too long

  const name = `${stepAction} ${stepValue}${truncatedTargetName} ${targetTagName}`;
  // remove newlines and excessive whitespace
  const formattedName = name.replace(/[\r\n]+/g, "").replace(/\s\s+/g, " ");

  return formattedName;
};

export const buildTest = (job: Job, useLocalModule: boolean = false) => {
  const test = testTemplate({
    formattedSteps: job.steps.map(step => ({
      name: formatStep(step),
      json: JSON.stringify(step)
    })),
    modulePath: useLocalModule ? `${cwd()}/dist/index.js` : "qawolf",
    name: job.name,
    size: job.size,
    url: job.url
  });

  return test;
};
