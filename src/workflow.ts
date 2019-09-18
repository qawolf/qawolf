export type Target = {
  xpath: string;
};

export type BrowserAction = {
  target: Target;
  type: "click" | "type";
  value?: string;
};

export type Workflow = {
  href: string;
  steps: BrowserAction[];
};
