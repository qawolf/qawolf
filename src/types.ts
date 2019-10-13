import { Size } from "./browser/device";

export type Action = "click" | "input" | "scroll";

export type BrowserStep = {
  action: Action;
  pageId?: number;
  scrollDirection?: "down" | "up";
  scrollTo?: number;
  target: ElementDescriptor;
  value?: string;
};

export type Job = {
  name: string;
  size: Size;
  steps: BrowserStep[];
  url: string;
};

export type ElementDescriptor = {
  ariaLabel?: string | null;
  classList?: string[] | null;
  dataValue?: string | null;
  href?: string | null;
  id?: string | null;
  inputType?: string | null;
  labels?: string[] | null;
  name?: string | null;
  parentText?: string[] | null;
  placeholder?: string | null;
  tagName?: string | null;
  textContent?: string | null;
  title?: string | null;
  xpath?: string | null;
};
