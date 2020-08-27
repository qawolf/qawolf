export type SelectorPart = {
  name: 'css' | 'text';
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
