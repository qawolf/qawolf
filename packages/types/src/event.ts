import { DocSelector } from "./selector";

export interface Event {
  isTrusted: boolean;
  name: EventName;
  page: number;
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
