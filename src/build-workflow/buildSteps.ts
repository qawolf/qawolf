import { concat, sortBy } from 'lodash';
import { buildClickSteps } from './buildClickSteps';
import { buildKeySteps } from './buildKeySteps';
import { buildScrollSteps } from './buildScrollSteps';
import { buildSelectSteps } from './buildSelectSteps';
import { ElementEvent, Step } from '../types';

export const buildSteps = (events: ElementEvent[], startIndex = 0): Step[] => {
  const unorderedSteps = concat(
    buildClickSteps(events),
    buildKeySteps(events),
    buildScrollSteps(events),
    buildSelectSteps(events),
  );

  let steps = sortBy(
    unorderedSteps,
    // ordered by the event time
    step => step.event.time,
  );

  // reindex
  steps = steps.map((step, index) => ({
    ...step,
    index: index + startIndex,
  }));

  return steps;
};
