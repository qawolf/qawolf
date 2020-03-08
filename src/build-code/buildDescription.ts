import { isNil } from 'lodash';
import { decodeHtml } from '../web/lang';
import { Doc, Step } from '../types';

export const describeDoc = (target: Doc): string => {
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

  if (description.length > 40) {
    description = `${description.substring(0, 40)}...`;
  }

  // strip single quotes so the description is valid javascript
  description = description.replace("'", '');

  // remove invisible characters which look like an empty string but have a length
  // https://www.w3resource.com/javascript-exercises/javascript-string-exercise-32.php
  // https://stackoverflow.com/a/21797208/230462
  description = description.replace(/[^\x20-\x7E]/g, '');

  if (description.length) {
    return ` "${description}"`;
  }

  return '';
};

export const buildDescription = (step: Step): string => {
  if (step.action === 'scroll') {
    return `scroll`;
  }

  const description = describeDoc(step.target);

  const target = step.target;

  // link/input
  const tagName = `${target.name === 'a' ? ' link' : ` ${target.name}` || ''}`;

  if (step.action === 'click') {
    return `click${description}${tagName}`;
  }

  if (step.action === 'select') {
    return `select${description}`;
  }

  if (step.action === 'press') {
    // self explanatory, no description necessary
    return '';
  }

  if (step.action === 'fill' || step.action === 'type') {
    if (step.value === '' || isNil(step.value)) {
      return `clear${description}${tagName}`;
    }

    return `type into${description}${tagName}`;
  }

  throw new Error(`Invalid step action ${step.action}`);
};
