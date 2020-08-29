import { buildStepLines, StepLineBuildContext } from './buildStepLines';
import { Step } from '../types';
import { VirtualCode } from './VirtualCode';

export const buildVirtualCode = (steps: Step[]): VirtualCode => {
  const lines: string[] = [];

  const buildContext: StepLineBuildContext = {
    initializedFrames: new Map<string, string>(),
    // page 0 is initialized and brought to front in "before"
    initializedPages: new Set([0]),
    visiblePage: 0,
  };

  steps.forEach((step) => {
    lines.push(...buildStepLines(step, buildContext));
  });

  return new VirtualCode(lines);
};
