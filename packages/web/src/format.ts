import { DocSelector } from "@qawolf/types";
import { decodeHtml } from "./lang";

export const describeDoc = (html: DocSelector): string => {
  const target = html.node;

  const attrs = target.attrs || {};

  // ex. "departure date"
  let description =
    attrs.labels ||
    attrs.name ||
    attrs.placeholder ||
    decodeHtml(attrs.innertext) ||
    attrs.id ||
    attrs.alt ||
    "";

  description = description.trim();

  if (description.length > 40) {
    description = `${description.substring(0, 40)}...`;
  }

  if (description.length) {
    // strip single quotes so the description is valid javascript
    return ` "${description}"`.replace("'", "");
  }

  return "";
};
