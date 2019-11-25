import { Locator } from "@qawolf/types";
import { topMatch } from "./match.remove";
import { queryActionElements, queryDataElements } from "./query";
import { waitFor } from "./wait";
import { findElementByXpath } from "./xpath";

export const findElement = async ({
  action,
  dataAttribute,
  target,
  timeoutMs,
  value
}: Locator) => {
  if (dataAttribute && target.dataValue) {
    console.log(
      `finding element by data attribute ${dataAttribute}=${target.dataValue}`,
      target
    );
    return waitFor(() => {
      const elements = queryDataElements({
        action,
        dataAttribute,
        dataValue: target.dataValue!
      });

      const match = topMatch({ dataAttribute, target, elements, value });
      if (match) return match.element;

      return null;
    }, timeoutMs);
  }

  // return root elements right away
  if (target.xpath === "/html" || target.xpath === "/html/body")
    return findElementByXpath(target.xpath);

  console.log("waiting for top strong match", target);

  const strongMatch = await waitFor(() => {
    const elements = queryActionElements(action);
    return topMatch({
      dataAttribute,
      target,
      elements,
      requireStrongMatch: true,
      value
    });
  }, timeoutMs);
  if (strongMatch) return strongMatch.element;

  console.log(
    "no strong match found before timeout, choosing top weak match",
    target
  );
  const elements = queryActionElements(action);
  const match = topMatch({ dataAttribute, target, elements, value });
  if (match) return match.element;

  return null;
};
