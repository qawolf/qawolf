import { concat, sortBy } from 'lodash';
import { buildClickSteps } from './buildClickSteps';
import { buildKeySteps } from './buildKeySteps';
import { buildScrollSteps } from './buildScrollSteps';
import { buildSelectSteps } from './buildSelectSteps';
import { ElementEvent, Step } from '../types';

export type BuildStepsOptions = {
  events: ElementEvent[];
  startIndex?: number;
};

export const buildSteps = ({
  events,
  ...options
}: BuildStepsOptions): Step[] => {
  const unorderedSteps = concat(
    buildClickSteps(events),
    buildKeySteps(events),
    buildScrollSteps(events),
    buildSelectSteps(events),
  );

  let steps = sortBy(
    unorderedSteps,
    // ordered by the event index
    step => step.index,
  );

  // reindex
  const startIndex = options.startIndex || 0;
  steps = steps.map((step, index) => ({
    ...step,
    index: index + startIndex,
  }));

  return steps;
};
