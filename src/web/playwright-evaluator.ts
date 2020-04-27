/* eslint-disable */
declare module 'playwright-evaluator' {
  type Selector = {
    name: 'css' | 'text';
    body: string;
  };

  class Evaluator {
    querySelectorAll(selector: Selector[], root: HTMLElement): HTMLElement[];
  }

  export const evaluator: Evaluator;
}
