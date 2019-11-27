export type Action = "click" | "type" | "scroll" | "select";

export type Callback<S = void, T = void> = (data?: S) => T;

export interface Doc {
  type: string;
  content?: string;
  voidElement: boolean;
  name: string;
  attrs: any;
  children: Doc[];
}

export type DocSelector = {
  node: Doc;
  ancestors: Doc[];
};

export type DocSelectorSerialized = {
  node: string;
  ancestors: string[];
};

export interface Event {
  name: EventName;
  isTrusted: boolean;
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
  timeoutMs?: number;
  value?: string;
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
  index: number;
  page?: number;
  selector: DocSelector;
  value?: StepValue;
};

export type StepValue = string | ScrollValue | null | undefined;

export type Workflow = {
  name: string;
  size: Size;
  steps: Step[];
  url: string;
};
