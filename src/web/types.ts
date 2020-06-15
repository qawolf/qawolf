export type SelectorPart = {
  name: 'css' | 'text';
  body: string;
};

export type ParsedSelector = {
  capture?: boolean;
  parts: SelectorPart[];
};

export type QuerySelectorAllFn = (
  selector: ParsedSelector,
  root: HTMLElement,
) => HTMLElement[];
