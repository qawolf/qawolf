import { waitUntil } from "./wait";

export const waitForOption = async (
  element: HTMLSelectElement,
  value: string | null,
  timeoutMs: number = 10000
) => {
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
