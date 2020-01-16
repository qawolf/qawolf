import { CONFIG } from "@qawolf/config";
import { Selector, Step } from "@qawolf/types";
import { serializeDocSelector } from "@qawolf/web";

export const stepToSelector = (step: Step): Selector => {
  const attributes = CONFIG.attribute.split(",");

  const attributeWithValue = attributes.find(
    attr => !!step.html.node.attrs[attr]
  );

  if (attributeWithValue) {
    const value = step.html.node.attrs[attributeWithValue];

    return {
      css: `[${attributeWithValue}='${value}']`
    };
  }

  return {
    html: serializeDocSelector(step.html)
  };
};
