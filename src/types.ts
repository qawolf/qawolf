import { Executor } from "./web/Executor";

export type BrowserAction = {
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

export type QAWolf = {
  actions: {
    click: (xpath: string) => void;
    setInputValue: (xpath: string, value: string) => void;
  };
  Executor: Function & {
    new (actions: BrowserAction[]): Executor;
    prototype: Executor;
  };
  selector: {
    getLabels: (element: HTMLElement) => string[] | null;
    getParentText: (element: HTMLElement) => string[] | null;
    getPlaceholder: (element: HTMLElement) => string | null;
    getSelector: (element: HTMLElement) => ElementSelector | null;
    getTextContent: (element: HTMLElement) => string | null;
  };
};

export type Workflow = {
  href: string;
  steps: BrowserAction[];
};
