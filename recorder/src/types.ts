export type Evaluator = {
  querySelector(selector: string, root: Node): HTMLElement;
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
