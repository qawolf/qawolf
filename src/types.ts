export type BrowserAction = {
  sourceEventId?: number;
  target: Target;
  type: "click" | "type";
  value?: string;
};

export type Target = {
  xpath: string;
};

export type Workflow = {
  href: string;
  steps: BrowserAction[];
};
