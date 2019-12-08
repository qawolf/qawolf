import { Action } from "./common";

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
export type CssSelector = string;

export interface Doc {
  attrs?: any;
  children?: Doc[];
  content?: string;
  name?: string;
  type: string;
  voidElement?: boolean;
}

export interface DocSelector {
  ancestors: Doc[];
  node: Doc;
}

export interface DocSelectorSerialized {
  ancestors: string[];
  node: string;
}

export interface FindOptions {
  dataAttribute?: string;
  // how long to sleep after finding the element
  sleepMs?: number;
  // how long to wait for the element
  timeoutMs?: number;
  waitForRequests?: boolean;
}

export type HtmlSelector = string | DocSelector | DocSelectorSerialized;

export interface Selector {
  action?: Action;
  css?: CssSelector;
  html?: HtmlSelector;
  text?: string;
  page?: number;
  value?: any;
}
