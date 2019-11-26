import { Step } from "@qawolf/types";

export const formatDescription = (step: Step): string => {
  const target = step.target.node;

  // TODO
  // const label = target.labels ? target.labels.join(" ") : "";

  // ex. "departure date"
  let description =
    // label ||
    target.attrs.name ||
    target.attrs.placeholder ||
    // TODO
    // target.innerText ||
    target.attrs.id ||
    target.attrs.alt ||
    "";

  description = description.trim();

  if (description.length > 40) {
    description = `${description.substring(0, 40)}...`;
  }

  if (description.length) return ` "${description}"`;

  return "";
};

export const formatIt = (step: Step): string => {
  if (step.action === "scroll") {
    return `can scroll`;
  }

  const description = formatDescription(step);

  const target = step.target.node;

  // link/input
  const tagName = `${target.name === "a" ? " link" : ` ${target.name}` || ""}`;

  if (step.action === "click") {
    return `can click${description}${tagName}`;
  }

  if (step.action === "select") {
    return `can select${description}`;
  }

  if (step.action === "type") {
    if (!step.value) {
      return `can clear${description}${tagName}`;
    }

    const value = step.value as string;
    if (value.indexOf("↓Enter") === 0) {
      return `can Enter`;
    }

    if (value.indexOf("↓Tab") === 0) {
      return `can Tab`;
    }

    return `can type into${description}${tagName}`;
  }

  throw new Error(`Invalid step action ${step.action}`);
};
