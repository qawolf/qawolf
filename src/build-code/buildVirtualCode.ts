import { buildStepLines, StepLineBuildContext } from './buildStepLines';
import { Step } from '../types';
import { VirtualCode } from './VirtualCode';

export const buildVirtualCode = (steps: Step[]): VirtualCode => {
  const lines: string[] = [];

  const buildContext: StepLineBuildContext = {
    initializedFrames: new Map<string, string>(),
    initializedPages: new Set([]),
    visiblePage: 0,
  };

  steps.forEach((step) => {
    lines.push(...buildStepLines(step, buildContext));
  });

  return new VirtualCode(lines);
};
