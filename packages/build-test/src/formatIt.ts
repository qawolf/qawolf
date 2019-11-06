import { Step } from "@qawolf/types";

export const formatTarget = (step: Step): string => {
  // link/input/select
  const tagName = `${
    step.target.tagName === "a" ? "link" : step.target.tagName || ""
  }`;

  const label = step.target.labels ? step.target.labels.join(" ") : "";

  // ex. "departure date"
  let description =
    label ||
    step.target.name ||
    step.target.placeholder ||
    step.target.innerText ||
    step.target.id ||
    "";

  description = description.trim();

  if (description.length > 40) {
    description = `${description.substring(0, 40)}...`;
  }

  if (description.length) return `"${description}" ${tagName}`;

  return tagName;
};

export const formatIt = (step: Step): string => {
  if (step.action === "scroll") {
    return `can scroll`;
  }

  const target = formatTarget(step);

  if (step.action === "click") {
    return `can click ${target}`;
  }

  //   if (step.action === "select") {
  //     return `can input into ${target}`;
  //   }

  if (step.action === "type") {
    if (!step.value) {
      return `can clear ${target}`;
    }

    const value = step.value as string;
    if (value.indexOf("↓Enter") === 0) {
      return `can Enter`;
    }

    if (value.indexOf("↓Tab") === 0) {
      return `can Tab`;
    }

    return `can type into ${target}`;
  }

  throw new Error(`Invalid step action ${step.action}`);
};
