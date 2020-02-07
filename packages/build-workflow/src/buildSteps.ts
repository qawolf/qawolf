import { ElementEvent, Step } from "@qawolf/types";
import { concat, sortBy } from "lodash";
import { buildClickSteps } from "./buildClickSteps";
import { buildScrollSteps } from "./buildScrollSteps";
import { buildSelectSteps } from "./buildSelectSteps";
import { buildTypeSteps } from "./buildTypeSteps";

export type BuildStepsOptions = {
  canChange?: boolean;
  events: ElementEvent[];
  stepStartIndex?: number;
};

export const buildSteps = ({
  events,
  ...options
}: BuildStepsOptions): Step[] => {
  const unorderedSteps = concat(
    buildClickSteps(events),
    buildScrollSteps(events),
    buildSelectSteps(events),
    buildTypeSteps(events)
  );

  let steps = sortBy(
    unorderedSteps,
    // ordered by the event index
    step => step.index
  );

  if (!options.canChange) {
    steps = steps.filter(step => !step.canChange);
  }

  // reindex
  const startIndex = options.stepStartIndex || 0;
  steps = steps.map((step, index) => ({
    ...step,
    index: index + startIndex
  }));

  return steps;
};
