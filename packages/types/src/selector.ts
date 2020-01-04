import { Action } from "./common";

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

export type DocSelectorSerialized =
  | string
  | {
      ancestors: string[];
      node: string;
    };

export interface FindElementOptions extends FindPageOptions {
  // filter eligible elements by action
  action?: Action;
  // how long to sleep after finding the element
  sleepMs?: number;
}

export interface FindPageOptions {
  page?: number;
  timeoutMs?: number;
  waitForRequests?: boolean;
}

export interface CssSelector {
  // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
  css: string;
}

export interface HtmlSelector {
  html: DocSelectorSerialized;
}
export interface TextSelector {
  text: string;
}

export type Selector = HtmlSelector | CssSelector | TextSelector;
