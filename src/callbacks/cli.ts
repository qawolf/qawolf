import { BrowserRunner } from "../BrowserRunner";
import render from "../cli/Runs";
import { Callback } from "../Runner";
import { BrowserStep, Job, Run, Step } from "../types";

export const createRunFromJob = (job: Job): Run => {
  const formattedSteps = job.steps.map(step => formatStep(step));

  return {
    status: "queued",
    steps: formattedSteps,
    name: job.name
  };
};

export const formatStep = (step: BrowserStep): Step => {
  const stepAction = step.type === "type" ? "enter" : "click";
  const stepValue = step.value ? `${step.value} into ` : "";
  const targetTagName = step.locator.inputType
    ? `${step.locator.tagName}[type='${step.locator.inputType}']`
    : `${step.locator.tagName === "a" ? "link" : step.locator.tagName || ""}`;
  const label = step.locator.labels ? step.locator.labels[0] : "";

  const targetName =
    step.locator.textContent ||
    label ||
    step.locator.name ||
    step.locator.placeholder ||
    step.locator.id ||
    "";

  const name = `${stepAction} ${stepValue}${targetName} ${targetTagName}`;

  return {
    name,
    status: "queued"
  };
};

export const renderCli: Callback = (runner: BrowserRunner) => {
  render(runner.runs);
};
