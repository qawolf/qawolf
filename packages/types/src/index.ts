export type Action = "click" | "input" | "scroll";

export type BrowserStep = {
  action: Action;
  index: number;
  pageId?: number;
  scrollDirection?: "down" | "up";
  scrollTo?: number;
  target: ElementDescriptor;
  value?: string;
};

export type ElementDescriptor = {
  classList?: string[] | null;
  dataValue?: string | null;
  href?: string | null;
  iconContent?: string[] | null;
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

export type Job = {
  name: string;
  size: Size;
  steps: BrowserStep[];
  url: string;
};

export type Locator = {
  action: Action;
  dataAttribute: string | null;
  target: ElementDescriptor;
  timeoutMs: number;
  value?: string | null;
};

export type Size = "desktop" | "tablet" | "mobile";
