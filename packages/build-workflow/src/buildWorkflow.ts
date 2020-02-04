import { ElementEvent, Workflow } from "@qawolf/types";
import { buildSteps } from "./buildSteps";

type Options = {
  device?: string;
  events: ElementEvent[];
  name: string;
  url: string;
};

export const buildWorkflow = (options: Options): Workflow => {
  const steps = buildSteps(options.events);

  const workflow = {
    device: options.device,
    name: options.name,
    steps,
    url: options.url
  };

  return workflow;
};
