import { ScrollValue, Step } from '../types';
import { isUndefined } from 'util';

export const didPageChange = (step: Step, previous?: Step): boolean => {
  if (!previous) return false;

  return step.page !== previous.page;
};

export const buildPageLine = (step: Step): string => {
  return `page = await qawolf.waitForPage(page.context(), ${step.page});`;
};

export const buildSelector = (step: Step): string => {
  const { cssSelector } = step;
  if (cssSelector) return `"${cssSelector}"`;

  // lookup html selector by index
  return `selectors[${step.index}]`;
};

export const buildValue = ({ action, value }: Step): string => {
  if (action === 'scroll') {
    const scrollValue = value as ScrollValue;
    return `{ x: ${scrollValue.x}, y: ${scrollValue.y} }`;
  }

  if (isUndefined(value)) return '';

  return JSON.stringify(value);
};

export const buildExpressionLine = (step: Step): string => {
  const { action } = step;

  const args: string[] = [buildSelector(step)];

  const value = buildValue(step);
  if (value) args.push(value);

  let methodOpen = `page.${action}(`;
  if (action === 'scroll') {
    methodOpen = `qawolf.scroll(page, `;
  }

  const expression = `await ${methodOpen}${args.join(', ')});`;
  return expression;
};

export const buildStepLines = (step: Step, previous?: Step): string[] => {
  const lines: string[] = [];

  if (didPageChange(step, previous)) {
    lines.push(buildPageLine(step));
  }

  lines.push(buildExpressionLine(step));

  return lines;
};
