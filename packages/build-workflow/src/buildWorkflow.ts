import { Event, Workflow } from "@qawolf/types";
import { buildSteps } from "./buildSteps";

type Options = {
  device?: string;
  events: Event[];
  name: string;
  url: string;
};

export const buildWorkflow = (options: Options): Workflow => {
  const steps = buildSteps(options.events);

  const workflow = {
    name: options.name,
    device: options.device,
    steps,
    url: options.url
  };

  return workflow;
};
