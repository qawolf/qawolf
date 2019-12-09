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

export interface StepSerialized extends Selector {
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
