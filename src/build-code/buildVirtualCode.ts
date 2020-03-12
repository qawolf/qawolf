import { buildStepLines } from './buildStepLines';
import { Step } from '../types';
import { VirtualCode } from './VirtualCode';

export const buildVirtualCode = (steps: Step[]): VirtualCode => {
  let previous: Step = null;
  const lines: string[] = [];

  steps.forEach(step => {
    lines.push(...buildStepLines(step, previous));
    previous = step;
  });

  return new VirtualCode(lines);
};
