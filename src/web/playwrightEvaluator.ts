export type SelectorPart = {
  name: 'css' | 'text';
  body: string;
};

export type ParsedSelector = {
  capture?: boolean;
  parts: SelectorPart[];
};

export const querySelectorAll = (
  selector: ParsedSelector,
  root: HTMLElement,
): HTMLElement[] => {
  throw new Error(
    'This should never be called. It should replaced by the virtual module' +
      { selector, root },
  );
};
