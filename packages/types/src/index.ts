export type Action = "click" | "type" | "scroll";

export type Callback<S = void, T = void> = (data?: S) => T;

export type ElementDescriptor = {
  ariaLabel?: string | null;
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
  innerText?: string | null;
  title?: string | null;
  xpath?: string | null;
};

export type EventName = "click" | "keyup" | "scroll";

export interface Event {
  name: EventName;
  isTrusted: boolean;
  pageId?: number;
  target: ElementDescriptor;
  time: number;
}

export interface KeyupEvent extends Event {
  name: "keyup";
  value?: string | null;
}

export type Locator = {
  action: Action;
  dataAttribute: string | null;
  target: ElementDescriptor;
  timeoutMs: number;
  value?: string | null;
};

export interface ScrollEvent extends Event {
  name: "scroll";
  value: ScrollValue;
}

export type ScrollValue = {
  x: number;
  y: number;
};

export type Size = "desktop" | "tablet" | "mobile";

export type Step = {
  action: Action;
  index: number;
  pageId?: number;
  target: ElementDescriptor;
  value?: StepValue;
};

export type StepValue = string | ScrollValue | null | undefined;

export type Workflow = {
  name: string;
  size: Size;
  steps: Step[];
  url: string;
};
