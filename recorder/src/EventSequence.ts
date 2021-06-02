import { getInputElementValue } from "./element";
import { EventDescriptor } from "./types";

export class EventSequence {
  // most recent event is first
  _events: EventDescriptor[];

  constructor(events: EventDescriptor[] = []) {
    this._events = events;
  }

  add(event: Event, selector?: string): void {
    const time = Date.now();

    let value: string;
    if (event.type === "change" || event.type === "input") {
      value = getInputElementValue(event.target as HTMLInputElement);
    } else if (event.type === "keydown") {
      value = (event as KeyboardEvent).key;
    }
    // coerce value to an empty string
    if (value !== undefined) value = typeof value === "string" ? value : "";

    this._events.unshift({
      eventTimeStamp: event.timeStamp,
      isTrusted: event.isTrusted,
      selector,
      target: event.target as HTMLElement,
      time,
      type: event.type,
      value,
    });

    // purge older events no longer relevant to this event
    this._events = this._events.filter((e) => time - e.time < 200);
  }

  getMostRecentClicks(): EventDescriptor[] {
    return this._events.filter((event) => event.type === "click");
  }

  getMouseDown(): EventDescriptor | undefined {
    return this._events.find((event) => event.type === "mousedown");
  }

  isDuplicateChangeOrInput(): boolean {
    // Fills come from both "input" and "change" events for completeness, but this
    // means that we could end up emitting back-to-back fills with the same value.
    // We can check here to avoid that. (For press and click, back-to-back identical
    // events could be valid.)
    const [last, previous] = this._events;

    if (
      !["change", "input"].includes(last && last.type) ||
      !["change", "input"].includes(previous && previous.type)
    )
      return false;

    return last.target === previous.target && last.value === previous.value;
  }

  isDuplicateClick(): boolean {
    // For a click, back-to-back events on the same selector may have been
    // intentional, but sometimes they have an identical timestamp. When this
    // happens it seems almost certain that we want to record only one.
    // The targets are usually different when this happens, but we'll find the
    // correct one when we search for the topmost click target while building
    // the selector.
    const [last, previous] = this._events;

    if (!last || !previous) return false;
    if (last.type !== "click" || previous.type !== "click") return false;

    return last.eventTimeStamp !== undefined && last.eventTimeStamp === previous.eventTimeStamp;
  }

  get last(): EventDescriptor {
    return this._events[0];
  }
}
