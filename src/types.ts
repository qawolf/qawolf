export type BrowserAction = {
  selector?: ElementSelector | null;
  sourceEventId?: number;
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

export type Workflow = {
  href: string;
  steps: BrowserAction[];
};
