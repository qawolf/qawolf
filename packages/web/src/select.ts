import { waitUntil } from "./wait";

export const isSelectValueAvailable = (
  element: HTMLElement,
  value?: string | null
): boolean => {
  if (!value || element.tagName.toLowerCase() !== "select") return true;

  let isAvailable: boolean = false;
  const options = (element as HTMLSelectElement).options;

  for (let i = 0; i < options.length; i++) {
    if (options[i].value === value) {
      isAvailable = true;
      break;
    }
  }

  return isAvailable;
};

export const waitForOption = async (
  element: HTMLSelectElement,
  value: string | null,
  timeoutMs: number = 10000
) => {
  if (!value) return;

  console.log("wait for option", value, element);

  await waitUntil(() => {
    const options = element.options;
    for (let i = 0; i < options.length; i++) {
      if (!options[i].disabled && options[i].value === value) {
        return true;
      }
    }

    return false;
  }, timeoutMs);

  console.log("found option", value, element);
};
