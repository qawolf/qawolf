import { ElementEvent, Workflow } from "@qawolf/types";
import { buildSteps } from "./buildSteps";

type Options = {
  device?: string;
  events: ElementEvent[];
  onlyFinalSteps?: boolean;
  name: string;
  url: string;
};

export const buildWorkflow = (options: Options): Workflow => {
  let steps = buildSteps(options.events);

  if (options.onlyFinalSteps) {
    steps = steps.filter(step => step.isFinal);
  }

  const workflow = {
    device: options.device,
    name: options.name,
    steps,
    url: options.url
  };

  return workflow;
};
