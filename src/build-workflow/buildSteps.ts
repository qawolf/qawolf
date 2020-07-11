import { concat, sortBy } from 'lodash';
import { buildClickSteps } from './buildClickSteps';
import { buildFillSteps } from './buildFillSteps';
import { buildPressSteps } from './buildPressSteps';
import { buildScrollSteps } from './buildScrollSteps';
import { buildSelectOptionSteps } from './buildSelectOptionSteps';
import { ElementEvent, Step } from '../types';

export const buildSteps = (events: ElementEvent[]): Step[] => {
  const unorderedSteps = concat(
    buildClickSteps(events),
    buildFillSteps(events),
    buildPressSteps(events),
    buildScrollSteps(events),
    buildSelectOptionSteps(events),
  );

  let steps = sortBy(
    unorderedSteps,
    // ordered by the event time
    (step) => step.event.time,
  );

  // reindex
  steps = steps.map((step, index) => ({
    ...step,
    index,
  }));

  return steps;
};
