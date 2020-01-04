import { Action } from "./common";
import { ScrollValue } from "./event";
import { DocSelector } from "./selector";

export interface Step {
  action: Action;
  html: DocSelector;
  index: number;
  page: number;
  value?: StepValue;
}

export type StepValue = string | ScrollValue | null | undefined;

export interface Workflow {
  device?: string;
  name: string;
  steps: Step[];
  url: string;
}
