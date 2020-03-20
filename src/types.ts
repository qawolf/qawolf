export type Action =
  | 'click'
  | 'fill'
  | 'press'
  | 'scroll'
  | 'selectOption'
  | 'type';

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

export type Callback<S = void, T = void> = (data?: S) => T;

export interface Doc {
  attrs?: any;
  children?: Doc[];
  content?: string;
  name?: string;
  type: string;
  voidElement?: boolean;
}

export interface ElementEvent {
  cssSelector?: string;
  htmlSelector: string;
  isTrusted: boolean;
  name: ElementEventName;
  page: number;
  target: Doc;
  time: number;
}

export type ElementEventName =
  | 'click'
  | 'input'
  | 'keydown'
  | 'keyup'
  | 'mousedown'
  | 'paste'
  | 'scroll'
  | 'selectall';

export interface InputEvent extends ElementEvent {
  name: 'input';
  value: string | null;
}

export interface KeyEvent extends ElementEvent {
  name: 'keydown' | 'keyup';
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  value: string;
}

export interface PasteEvent extends ElementEvent {
  name: 'paste';
  value: string;
}

export interface ScrollEvent extends ElementEvent {
  name: 'scroll';
  value: ScrollValue;
}

export type ScrollValue = {
  x: number;
  y: number;
};

export interface Selectors {
  [key: string]: string;
}

export interface Step {
  action: Action;
  event: ElementEvent;
  // needed to build selector key
  index: number;
  value?: StepValue;
}

export type StepValue = string | ScrollValue | null | undefined;

export interface Workflow {
  device?: string;
  name: string;
  steps: Step[];
  url: string;
}
