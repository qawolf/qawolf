export type Action = "click" | "type" | "scroll" | "select";

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

export interface Event {
  name: EventName;
  isTrusted: boolean;
  pageId?: number;
  target: ElementDescriptor;
  time: number;
}

export type EventName =
  | "click"
  | "input"
  | "keydown"
  | "keyup"
  | "paste"
  | "scroll";

export interface InputEvent extends Event {
  name: "input";
  value: string | null;
}

export interface KeyEvent extends Event {
  name: "keydown" | "keyup";
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  value: string;
}

export type Locator = {
  action: Action;
  dataAttribute: string | null;
  target: ElementDescriptor;
  timeoutMs: number;
  value?: string | null;
};

export interface PasteEvent extends Event {
  name: "paste";
  value: string;
}

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
