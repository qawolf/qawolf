import { Size } from "./browser/device";

export type Action = "click" | "scroll" | "type";

export type BrowserStep = {
  action: Action;
  locator: Locator;
  pageId?: number;
  scrollDirection?: "down" | "up";
  scrollTo?: number;
  value?: string;
};

export type Job = {
  name: string;
  size: Size;
  steps: BrowserStep[];
  url: string;
};

export type Locator = {
  classList?: string[] | null;
  dataAttribute?: string | null;
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
