import { Step } from '../types';
import { Expression } from './Expression';
import { VirtualCode } from './VirtualCode';

export const buildVirtualCode = (steps: Step[]): VirtualCode => {
  let previous: Expression;

  const expressions = steps.map(step => {
    const expression = new Expression(step, previous);
    previous = expression;
    return expression;
  });

  return new VirtualCode(expressions);
};
