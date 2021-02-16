// from playwright to make sure we match their text engine
const cachedText = new Map<Element | ShadowRoot, string>();

function shouldSkipForTextMatching(element: Element | ShadowRoot) {
  return (
    element.nodeName === "SCRIPT" ||
    element.nodeName === "STYLE" ||
    (document.head && document.head.contains(element))
  );
}

export function elementText(root: Element | ShadowRoot): string {
  let value = cachedText.get(root);
  if (value === undefined) {
    value = "";
    if (!shouldSkipForTextMatching(root)) {
      if (
        root instanceof HTMLInputElement &&
        (root.type === "submit" || root.type === "button")
      ) {
        value = root.value;
      } else {
        for (let child = root.firstChild; child; child = child.nextSibling) {
          if (child.nodeType === Node.ELEMENT_NODE)
            value += elementText(child as Element);
          else if (child.nodeType === Node.TEXT_NODE)
            value += child.nodeValue || "";
        }
        if ((root as Element).shadowRoot)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          value += elementText((root as Element).shadowRoot!);
      }
    }
    cachedText.set(root, value);
  }
  return value;
}
