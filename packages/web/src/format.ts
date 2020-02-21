import { DocSelector } from "@qawolf/types";
import { decodeHtml } from "./lang";

export const describeDoc = (html: DocSelector): string => {
  const target = html.node;

  const attrs = target.attrs || {};

  // ex. "departure date"
  let description: string =
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

  // strip single quotes so the description is valid javascript
  description = description.replace("'", "");

  // remove invisible characters which look like an empty string but have a length
  // https://www.w3resource.com/javascript-exercises/javascript-string-exercise-32.php
  // https://stackoverflow.com/a/21797208/230462
  description = description.replace(/[^\x20-\x7E]/g, "");

  if (description.length) {
    return ` "${description}"`;
  }

  return "";
};
