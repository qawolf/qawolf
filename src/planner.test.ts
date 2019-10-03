import { qaEventWithTime } from "./events";
import { isMouseDownEvent, isScrollEvent, isTypeEvent } from "./planner";

describe("isMouseDownEvent", () => {
  test("returns false if no data", () => {
    const event = {} as qaEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data source not mouse interaction", () => {
    const event = {
      data: {
        source: 1
      }
    } as qaEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data type not mouse down", () => {
    const event = {
      data: {
        source: 2,
        type: 2
      }
    } as qaEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data not trusted", () => {
    const event = {
      data: {
        source: 2,
        type: 1,
        isTrusted: false
      }
    } as qaEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns true if mouse down event", () => {
    const event = {
      data: {
        source: 2,
        type: 1,
        isTrusted: true
      }
    } as qaEventWithTime;

    expect(isMouseDownEvent(event)).toBe(true);
  });
});

describe("isScrollEvent", () => {
  test("returns false if no data", () => {
    const event = {} as qaEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns false if data source not scroll", () => {
    const event = {
      data: { source: 2 }
    } as qaEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns false if scroll not on page body", () => {
    const event = {
      data: { source: 3, id: 11 }
    } as qaEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns true if scroll on page body event", () => {
    const event = {
      data: { source: 3, id: 1 }
    } as qaEventWithTime;

    expect(isScrollEvent(event)).toBe(true);
  });
});

describe("isTypeEvent", () => {
  test("returns false if no data", () => {
    const event = {} as qaEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if data source not input", () => {
    const event = {
      data: { source: 2 }
    } as qaEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if data not trusted", () => {
    const event = {
      data: { source: 5, isTrusted: false }
    } as qaEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if no text", () => {
    const event = {
      data: { source: 5, isTrusted: true }
    } as qaEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns true if type event", () => {
    const event = {
      data: { source: 5, isTrusted: true, text: "spirit" }
    } as qaEventWithTime;

    expect(isTypeEvent(event)).toBe(true);
  });

  test("returns true if type event with empty string", () => {
    const event = {
      data: { source: 5, isTrusted: true, text: "" }
    } as qaEventWithTime;

    expect(isTypeEvent(event)).toBe(true);
  });
});
