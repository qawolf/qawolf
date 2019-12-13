import { waitFor } from "../wait";

export const hasText = async (
  text: string,
  timeoutMs: number
): Promise<boolean> => {
  const hasTextFn = () => {
    const innerText = document.documentElement
      ? document.documentElement.innerText
      : "";
    if (innerText.includes(text)) {
      return true;
    }
    return null;
  };

  console.log(`hasText: find "${text}" up to ${timeoutMs}ms`);
  const result = await waitFor(hasTextFn, timeoutMs, 100);
  console.log(`hasText: ${result ? "found" : "not found"}`);

  return result || false;
};
