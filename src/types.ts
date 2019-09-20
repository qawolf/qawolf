import { Executor } from "./web/Executor";

export type BrowserAction = {
  selector?: ElementSelector | null;
  sourceEventId: number;
  target: Target;
  type: "click" | "type";
  value?: string;
};

export type ElementSelector = {
  classList: string[] | null;
  href: string | null;
  id: string | null;
  inputType: string | null;
  labels: string[] | null;
  name: string | null;
  parentText: string[] | null;
  placeholder: string | null;
  tagName: string | null;
  textContent: string | null;
};

export type Target = {
  xpath: string;
};

export type Workflow = {
  href: string;
  steps: BrowserAction[];
};
