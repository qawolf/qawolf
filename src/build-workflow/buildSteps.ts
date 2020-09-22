import { concat, sortBy } from 'lodash';
import { buildClickSteps } from './buildClickSteps';
import { buildFillSteps } from './buildFillSteps';
import { buildNavigationSteps } from './buildNavigationSteps';
import { buildPressSteps } from './buildPressSteps';
import { buildScrollSteps } from './buildScrollSteps';
import { buildSelectOptionSteps } from './buildSelectOptionSteps';
import { ElementEvent, Step, WindowEvent } from '../types';

export const buildSteps = (elementEvents: ElementEvent[], windowEvents: WindowEvent[] = []): Step[] => {
  const unorderedSteps = concat(
    buildClickSteps(elementEvents),
    buildFillSteps(elementEvents),
    buildPressSteps(elementEvents),
    buildScrollSteps(elementEvents),
    buildSelectOptionSteps(elementEvents),
    buildNavigationSteps(windowEvents),
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
