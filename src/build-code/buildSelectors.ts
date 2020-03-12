import { snakeCase } from 'lodash';
import { decodeHtml } from '../web/lang';
import { Doc, Selectors, Step } from '../types';

export const buildSelectorKey = (index: number, target: Doc): string => {
  const attrs = target.attrs || {};

  // ex. "departure date"
  let description: string =
    attrs.labels ||
    attrs.name ||
    attrs.placeholder ||
    decodeHtml(attrs.innertext) ||
    attrs.id ||
    attrs.alt ||
    '';

  description = description.trim();

  if (description.length > 15) {
    description = `${description.substring(0, 15)}`;
  }

  // remove double quotes to make it usable as a JSON key
  description = description.replace('"', '');

  // remove invisible characters which look like an empty string but have a length
  // https://www.w3resource.com/javascript-exercises/javascript-string-exercise-32.php
  // https://stackoverflow.com/a/21797208/230462
  description = description.replace(/[^\x20-\x7E]/g, '');

  description += ` ${target.name}`;

  return snakeCase(`${index} ${description}`);
};

export const buildSelector = (step: Step): string => {
  const { cssSelector } = step.event;
  // inline the css selector
  if (cssSelector) return `"${cssSelector}"`;

  // lookup html selector by index
  return `selectors["${buildSelectorKey(step.index, step.event.target)}"]`;
};

export const buildSelectors = (steps: Step[]): Selectors => {
  const selectors: Selectors = {};

  steps.forEach(step => {
    const key = buildSelectorKey(step.index, step.event.target);
    selectors[key] =
      step.event.cssSelector || `html=${step.event.htmlSelector}`;
  });

  return selectors;
};
