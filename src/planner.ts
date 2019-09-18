import { eventWithTime, metaEvent } from "rrweb/typings/types";
import { BrowserAction, Workflow } from "./workflow";

export const findHref = (events: eventWithTime[]): string =>
  (events[0] as metaEvent).data.href;

export const planWorkflow = (events: eventWithTime[]): Workflow => {
  const href = findHref(events);
  const steps: BrowserAction[] = [];

  const workflow = { href, steps };
  return workflow;
};
