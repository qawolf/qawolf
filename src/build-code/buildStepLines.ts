import { ScrollValue, Step } from '../types';
import { isUndefined } from 'util';

export type StepLineBuildContext = {
  initializedFrames: Map<string, string>;
  initializedPages: Set<number>;
};

/**
 * @summary Given a step, returns the correct page variable for it,
 *   such as `page` for the main page or `page2` for the second page.
 */
export const getStepPageVariableName = (step: Step): string => {
  const { page } = step.event;
  return `page${page === 0 ? '' : page + 1}`;
};

export const escapeSelector = (selector: string): string => {
  if (!selector.includes(`"`)) return `"${selector}"`;
  if (!selector.includes(`'`)) return `'${selector}'`;

  return '`' + selector.replace(/`/g, '\\`') + '`';
};

export const buildValue = ({ action, value }: Step): string => {
  if (action === 'scroll') {
    const scrollValue = value as ScrollValue;
    return `{ x: ${scrollValue.x}, y: ${scrollValue.y} }`;
  }

  if (isUndefined(value)) return '';

  return JSON.stringify(value);
};

export const buildExpressionLine = (
  step: Step,
  frameVariable?: string,
): string => {
  const { action, event } = step;

  const args: string[] = [escapeSelector(event.selector)];

  const value = buildValue(step);
  if (value) args.push(value);

  const browsingContext = frameVariable || getStepPageVariableName(step);

  let methodOpen = `${browsingContext}.${action}(`;
  if (action === 'scroll') {
    methodOpen = `qawolf.scroll(${browsingContext}, `;
  }

  const expression = `await ${methodOpen}${args.join(', ')});`;
  return expression;
};

export const buildStepLines = (
  step: Step,
  buildContext: StepLineBuildContext = {
    initializedFrames: new Map<string, string>(),
    initializedPages: new Set(),
  },
): string[] => {
  const lines: string[] = [];

  const { frameSelector, page } = step.event;
  const { initializedFrames, initializedPages } = buildContext;

  const pageVariableName = getStepPageVariableName(step);
  if (page > 0 && !initializedPages.has(page)) {
    lines.push(
      `const ${pageVariableName} = await qawolf.waitForPage(page.context(), ${page});`,
    );
    initializedPages.add(page);
  }

  let frameVariableName: string;
  if (frameSelector) {
    frameVariableName = initializedFrames.get(frameSelector);
    if (!frameVariableName) {
      frameVariableName = `frame${
        initializedFrames.size ? initializedFrames.size + 1 : ''
      }`;
      lines.push(
        `const ${frameVariableName} = await (await ${pageVariableName}.waitForSelector(${escapeSelector(
          frameSelector,
        )})).contentFrame();`,
      );
      initializedFrames.set(frameSelector, frameVariableName);
    }
  }

  lines.push(buildExpressionLine(step, frameVariableName));

  return lines;
};
