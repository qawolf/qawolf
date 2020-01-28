export type Action = "click" | "type" | "scroll" | "select";

export type BrowserType = "chromium" | "firefox" | "webkit";

export type Callback<S = void, T = void> = (data?: S) => T;

export type TypeOptions = {
  delayMs?: number;
  skipClear?: boolean;
};
