import { CONFIG } from "@qawolf/config";
import { CssSelector, Selector, Step } from "@qawolf/types";
import { serializeDocSelector } from "@qawolf/web";

export const buildSelector = (step: Step): string => {
  const selector = stepToSelector(step);

  const cssValue = (selector as CssSelector).css;

  if (cssValue) {
    return `{ css: "${cssValue}" }`;
  }

  return `selectors[${step.index}]`;
};

export const stepToSelector = (step: Step): Selector => {
  const attributes = CONFIG.attribute.split(",").map(attr => attr.trim());

  const attrs = step.html.node.attrs || {};

  const attributeWithValue = attributes.find(attr => !!attrs[attr]);

  if (attributeWithValue) {
    const value = attrs[attributeWithValue];

    return {
      css: `[${attributeWithValue}='${value}']`
    };
  }

  return {
    html: serializeDocSelector(step.html)
  };
};
