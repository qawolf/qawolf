import { Workflow } from "@qawolf/types";
import { buildSteps, BuildStepsOptions } from "./buildSteps";

export type BuildWorkflowOptions = BuildStepsOptions & {
  device?: string;
  name: string;
  url: string;
};

export const buildWorkflow = (options: BuildWorkflowOptions): Workflow => {
  let steps = buildSteps(options);

  const workflow = {
    device: options.device,
    name: options.name,
    steps,
    url: options.url
  };

  return workflow;
};
