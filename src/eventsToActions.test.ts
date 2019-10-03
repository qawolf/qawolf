import { loadEvents } from "@qawolf/fixtures";
import { QAEventWithTime } from "./events";
import {
  findActions,
  getActionType,
  groupActions,
  isMouseDownEvent,
  isScrollEvent,
  isTypeEvent
} from "./eventsToActions";

describe("findActions", () => {
  test("returns only click, scroll, and type events", async () => {
    const events = await loadEvents("login");
    expect(events).toHaveLength(146);

    const filteredEvents = findActions(events);
    expect(filteredEvents).toHaveLength(85);
  });
});

describe("getActionType", () => {
  test("returns click if click action", () => {
    const action = {
      data: {
        source: 2,
        type: 1,
        isTrusted: true
      }
    } as QAEventWithTime;

    expect(getActionType(action)).toBe("click");
  });

  test("returns scroll if scroll action", () => {
    const action = {
      data: { source: 3, id: 1 }
    } as QAEventWithTime;

    expect(getActionType(action)).toBe("scroll");
  });

  test("returns type if type action", () => {
    const action = {
      data: { source: 5, isTrusted: true, text: "spirit" }
    } as QAEventWithTime;

    expect(getActionType(action)).toBe("type");
  });

  test("throws error if action type not found", () => {
    expect(() => {
      getActionType({ data: { source: 11 } } as QAEventWithTime);
    }).toThrowError();
  });
});

describe("groupActions", () => {
  test.only("returns actions grouped by element and type", async () => {
    const events = await loadEvents("login");
    const actions = findActions(events);
    const actionGroups = groupActions(actions);

    expect(actionGroups).toHaveLength(10);

    expect(actionGroups[0].type).toBe("scroll");
    expect(actionGroups[0].actions).toHaveLength(43);

    expect(actionGroups[1]).toMatchObject({
      type: "click",
      xpath: "//*[@id='content']/ul/li[18]/a"
    });
    expect(actionGroups[1].actions).toHaveLength(1);

    expect(actionGroups[2]).toMatchObject({
      type: "click",
      xpath: "//*[@id='username']"
    });
    expect(actionGroups[2].actions).toHaveLength(1);

    expect(actionGroups[3]).toMatchObject({
      type: "type",
      xpath: "//*[@id='username']"
    });
    expect(actionGroups[3].actions).toHaveLength(8);

    expect(actionGroups[4]).toMatchObject({
      type: "click",
      xpath: "//*[@id='login']/button"
    });
    expect(actionGroups[4].actions).toHaveLength(1);
  });
});

describe("isMouseDownEvent", () => {
  test("returns false if event undefined", () => {
    expect(isMouseDownEvent()).toBe(false);
  });

  test("returns false if no data", () => {
    const event = {} as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data source not mouse interaction", () => {
    const event = {
      data: {
        source: 1
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data type not mouse down", () => {
    const event = {
      data: {
        source: 2,
        type: 2
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data not trusted", () => {
    const event = {
      data: {
        source: 2,
        type: 1,
        isTrusted: false
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns true if mouse down event", () => {
    const event = {
      data: {
        source: 2,
        type: 1,
        isTrusted: true
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(true);
  });
});

describe("isScrollEvent", () => {
  test("returns false if event undefined", () => {
    expect(isScrollEvent()).toBe(false);
  });

  test("returns false if no data", () => {
    const event = {} as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns false if data source not scroll", () => {
    const event = {
      data: { source: 2 }
    } as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns false if scroll not on page body", () => {
    const event = {
      data: { source: 3, id: 11 }
    } as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns true if scroll on page body event", () => {
    const event = {
      data: { source: 3, id: 1 }
    } as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(true);
  });
});

describe("isTypeEvent", () => {
  test("returns false if event undefined", () => {
    expect(isTypeEvent()).toBe(false);
  });

  test("returns false if no data", () => {
    const event = {} as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if data source not input", () => {
    const event = {
      data: { source: 2 }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if data not trusted", () => {
    const event = {
      data: { source: 5, isTrusted: false }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if no text", () => {
    const event = {
      data: { source: 5, isTrusted: true }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns true if type event", () => {
    const event = {
      data: { source: 5, isTrusted: true, text: "spirit" }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(true);
  });

  test("returns true if type event with empty string", () => {
    const event = {
      data: { source: 5, isTrusted: true, text: "" }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(true);
  });
});
