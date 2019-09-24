import { BrowserRunner } from "../BrowserRunner";
import render from "../cli/Runs";
import { Callback } from "../Runner";
import { BrowserStep, Job, Run, Runs, Step } from "../types";

export const buildRuns = (run: Run): Runs => {
  const summary =
    run.status === "pass" || run.status === "fail"
      ? {
          fail: run.status === "fail" ? 1 : 0,
          pass: run.status === "pass" ? 1 : 0,
          total: 1
        }
      : null;

  return {
    runs: [{ ...run }],
    summary
  };
};

export const createRunFromJob = (job: Job): Run => {
  const formattedSteps = job.steps.map(step => formatStep(step));

  return {
    status: "queued",
    startTime: new Date(),
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
  const runs = buildRuns(runner.getRun());

  render(runs);
};
