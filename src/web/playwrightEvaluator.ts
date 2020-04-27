type Selector = {
  name: 'css' | 'text';
  body: string;
};

export const querySelectorAll = (
  selector: Selector[],
  root: HTMLElement,
): HTMLElement[] => {
  throw new Error(
    'This should never be called. It should replaced by the virtual module' +
      { selector, root },
  );
};
