import { ElementDescriptor } from "../types";

// Specific:
// id/name/labels/placeholder/textContent

// Match({ specific: true/false })
// Xpath
// Href

export const locateElement = (
  target: ElementDescriptor,
  timeout: number = 30000
) => {
  if (target.dataValue) {
    return waitFor(() => selectTop(queryByData()));
  }

  const match = await waitFor(() => selectTop(queryByAction(), true));
  if (match) return match;

  return selectTop(queryByAction());
};

const queryByAction = action => {
  const selector = action === "input" ? "textarea/input" : "*";
  return queryVisible(selector);
};

const queryByData = () => {
  const selector = action === "input" ? "textarea/input" : "*";

  const elements = queryVisible(
    `[${this.dataAttribute}='${this.target.dataValue}']`
  );
  return elements;
};
