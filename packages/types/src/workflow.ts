import { Action } from "./common";
import { ScrollValue } from "./event";
import { DocSelector, DocSelectorSerialized, Selector } from "./selector";

export type Size = "desktop" | "tablet" | "mobile";

export interface Step extends Selector {
  action: Action;
  html: DocSelector;
  index: number;
  page: number;
  value?: StepValue;
}

// TODO remove or replace w/ selector?
export interface StepSerialized {
  action: Action;
  html: DocSelectorSerialized;
  index: number;
  page: number;
}

export type StepValue = string | ScrollValue | null | undefined;

export interface Workflow {
  name: string;
  size: Size;
  steps: Step[];
  url: string;
}

// TODO remove
export interface WorkflowSerialized {
  name: string;
  size: Size;
  steps: StepSerialized[];
  url: string;
}
