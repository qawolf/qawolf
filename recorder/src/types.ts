export type SelectorPart = {
  name: "css" | "text";
  body: string;
};

export type ParsedSelector = {
  capture?: boolean;
  parts: SelectorPart[];
};

export type Evaluator = {
  createTextSelector(element: Element): string | undefined;

  isVisible(element: Element): boolean;

  querySelector(selector: ParsedSelector, root: Node): HTMLElement;
};

export type Action =
  | "click"
  | "fill"
  | "goBack"
  | "goForward"
  | "goto"
  | "press"
  | "reload"
  | "selectOption";

export type Callback<S = void, T = void> = (data?: S) => T;

export interface Doc {
  attrs: Record<string, string>;
  name: string;
}

export interface ElementAction {
  action: Action;
  selector: string;
  time: number;
  value?: string | null;
}

export interface LogEvent {
  level: string;
  message: string;
}

export type PossibleAction = {
  action: Action;
  isTrusted: boolean;
  target: HTMLElement;
  time: number;
  value: string | null;
};
