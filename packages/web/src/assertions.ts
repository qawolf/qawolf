import { AssertParams } from "@qawolf/types";
import { waitFor } from "./timer";

export const hasText = async (
  text: string,
  { timeoutMs }: AssertParams
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

  const result = await waitFor(hasTextFn, timeoutMs, 100);

  return result || false;
};
