import { Event, Size, Workflow } from "@qawolf/types";
import { buildSteps } from "./buildSteps";

type Options = {
  events: Event[];
  name: string;
  size?: Size;
  url: string;
};

export const buildWorkflow = (options: Options): Workflow => {
  const steps = buildSteps(options.events);

  const workflow = {
    name: options.name,
    // XXX add size option to recorder
    size: options.size || "desktop",
    steps,
    url: options.url
  };

  return workflow;
};
