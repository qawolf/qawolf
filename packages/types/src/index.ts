export type Action = "click" | "type" | "scroll" | "select";

export type Callback<S = void, T = void> = (data?: S) => T;

export interface Doc {
  attrs?: any;
  children?: Doc[];
  content?: string;
  name?: string;
  type: string;
  voidElement?: boolean;
}

export type DocSelector = {
  ancestors: Doc[];
  node: Doc;
};

export type DocSelectorSerialized = {
  ancestors: string[];
  node: string;
};

export interface Event {
  isTrusted: boolean;
  name: EventName;
  page?: number;
  target: DocSelector;
  time: number;
}

export type EventName =
  | "click"
  | "input"
  | "keydown"
  | "keyup"
  | "paste"
  | "scroll";

export type FindOptions = {
  action?: Action;
  dataAttribute?: string;
  timeoutMs: number;
  value?: string;
  waitForRequests?: boolean;
};

export interface InputEvent extends Event {
  name: "input";
  value: string | null;
}

export interface KeyEvent extends Event {
  name: "keydown" | "keyup";
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  value: string;
}

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
  html: DocSelector;
  index: number;
  page?: number;
  value?: StepValue;
};

export type StepSerialized = {
  action: Action;
  html: DocSelectorSerialized;
  index: number;
  page?: number;
};

export type StepValue = string | ScrollValue | null | undefined;

export type Workflow = {
  name: string;
  size: Size;
  steps: Step[];
  url: string;
};

export type WorkflowSerialized = {
  name: string;
  size: Size;
  steps: StepSerialized[];
  url: string;
};
