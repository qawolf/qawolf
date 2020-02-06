import { ElementEvent, Workflow } from "@qawolf/types";
import { buildSteps } from "./buildSteps";

type Options = {
  device?: string;
  events: ElementEvent[];
  onlyFinalSteps?: boolean;
  name: string;
  stepStartIndex?: number;
  url: string;
};

export const buildWorkflow = (options: Options): Workflow => {
  let steps = buildSteps(options.events);

  if (options.onlyFinalSteps) {
    steps = steps.filter(step => step.isFinal);
  }

  // reindex
  steps = steps.map((step, index) => ({
    ...step,
    index: index + (options.stepStartIndex || 0)
  }));

  const workflow = {
    device: options.device,
    name: options.name,
    steps,
    url: options.url
  };

  return workflow;
};
