export type BrowserStep = {
  locator: Locator;
  sourceEventId?: number;
  type: "click" | "type";
  value?: string;
};

export type Job = {
  href: string;
  steps: BrowserStep[];
};

export type Locator = {
  classList?: string[] | null;
  href?: string | null;
  id?: string | null;
  inputType?: string | null;
  labels?: string[] | null;
  name?: string | null;
  parentText?: string[] | null;
  placeholder?: string | null;
  tagName?: string | null;
  textContent?: string | null;
  xpath?: string | null;
};
