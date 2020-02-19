import { DocSelector } from "./selector";

export interface ElementEvent {
  isTrusted: boolean;
  name: ElementEventName;
  page: number;
  target: DocSelector;
  time: number;
}

export type ElementEventName =
  | "click"
  | "input"
  | "keydown"
  | "keyup"
  | "paste"
  | "scroll"
  | "selectall";

export interface InputEvent extends ElementEvent {
  name: "input";
  value: string | null;
}

export interface KeyEvent extends ElementEvent {
  name: "keydown" | "keyup";
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  value: string;
}

export interface PasteEvent extends ElementEvent {
  name: "paste";
  value: string;
}

export interface ScrollEvent extends ElementEvent {
  name: "scroll";
  value: ScrollValue;
}

export type ScrollValue = {
  x: number;
  y: number;
};
