export type SelectorPart = {
  name: 'css' | 'text';
  body: string;
};

export type ParsedSelector = {
  capture?: boolean;
  parts: SelectorPart[];
};

export type Evaluator = {
  isVisible(element: Element): boolean;

  querySelectorAll(selector: ParsedSelector, root: Node): HTMLElement[];
};
