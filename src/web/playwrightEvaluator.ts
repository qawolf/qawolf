export type SelectorPart = {
  name: 'css' | 'text';
  body: string;
};

export const querySelectorAll = (
  selectorParts: SelectorPart[],
  root: HTMLElement,
): HTMLElement[] => {
  throw new Error(
    'This should never be called. It should replaced by the virtual module' +
      { selectorParts, root },
  );
};
