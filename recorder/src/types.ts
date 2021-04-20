export type Evaluator = {
  querySelector(selector: string, root: Node): HTMLElement;
};

export type Action =
  | "click"
  | "fill"
  | "goBack"
  | "goForward"
  | "goto"
  | "keyboard.press"
  | "press"
  | "reload"
  | "selectOption";

export type Callback<S = void, T = void> = (data?: S) => T;

export type CueType =
  | "attribute"
  | "class"
  | "id"
  | "modifier"
  | "tag"
  | "text";

export type Cue = {
  level: number; // 0 is target, 1 is parent, etc.
  penalty: number; // Cue type penalty plus PENALTY_PER_LEVEL
  type: CueType;
  value: string;
};

export type CueSet = {
  cues: Cue[];
  penalty: number;
  valueLength: number;
};

export interface ElementAction {
  action: Action;
  selector: string;
  time: number;
  value?: string | null;
}

export interface ElementChosen {
  isFillable: boolean;
  selectors: string[];
  text: string;
}

export type EventDescriptor = {
  isTrusted: boolean;
  selector?: string;
  target: HTMLElement;
  time: number;
  type: string;
  value: string | null;
};

export interface LogEvent {
  level: string;
  message: string;
}

export type RankedSelector = {
  penalty: number;
  selector: string;
};

export type Rect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type Target = {
  element: HTMLElement;
  level: number;
};
