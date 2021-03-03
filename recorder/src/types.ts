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

export type Cue = {
  level: number; // 0 is target, 1 is parent, etc.
  penalty: number; // Cue type penalty plus PENALTY_PER_LEVEL
  type: "attribute" | "class" | "id" | "tag" | "text";
  value: string;
};

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

export type Selector = {
  elementText?: string;
  penalty: number;
  value: string;
};

export type Target = {
  element: HTMLElement;
  level: number;
};
