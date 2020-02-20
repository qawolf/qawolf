import { Action } from "./common";
import { ScrollValue } from "./event";
import { DocSelector } from "./selector";

export interface Step {
  action: Action;
  cssSelector?: string;
  html: DocSelector;
  index: number;
  page: number;
  replace?: boolean;
  value?: StepValue;
}

export type StepValue = string | ScrollValue | null | undefined;

export interface Workflow {
  device?: string;
  name: string;
  steps: Step[];
  url: string;
}
