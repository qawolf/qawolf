import { ScrollValue, Step } from '../types';
import { isUndefined } from 'util';

export const didPageChange = (step: Step, previous?: Step): boolean => {
  if (!previous) return false;

  return step.event.page !== previous.event.page;
};

export const buildPageLine = (step: Step): string => {
  return `page = await qawolf.waitForPage(page.context(), ${step.event.page});`;
};

export const buildSelector = (step: Step): string => {
  const { selector } = step.event;

  if (!selector.includes(`"`)) return `"${selector}"`;
  if (!selector.includes(`'`)) return `'${selector}'`;

  return '`' + selector + '`';
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
