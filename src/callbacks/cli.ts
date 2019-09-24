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
  const targetTagName = step.selector.inputType
    ? `${step.selector.tagName}[type='${step.selector.inputType}']`
    : `${step.selector.tagName === "a" ? "link" : step.selector.tagName || ""}`;
  const label = step.selector.labels ? step.selector.labels[0] : "";

  const targetName =
    step.selector.textContent ||
    label ||
    step.selector.name ||
    step.selector.placeholder ||
    step.selector.id ||
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
