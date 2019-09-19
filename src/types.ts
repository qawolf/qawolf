import { Executor } from "./web/Executor";

export type BrowserAction = {
  sourceEventId: number;
  target: Target;
  type: "click" | "type";
  value?: string;
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
};

export type Workflow = {
  href: string;
  steps: BrowserAction[];
};
