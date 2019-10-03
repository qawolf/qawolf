import { loadEvents } from "@qawolf/fixtures";
import { QAEventWithTime } from "./events";
import eventsToSteps, {
  buildStepsFromActionGroups,
  findActions,
  formatClickSteps,
  formatScrollStep,
  formatTypeStep,
  getActionType,
  groupActions,
  isMouseDownEvent,
  isScrollEvent,
  isTypeEvent
} from "./eventsToSteps";

export const finalSteps = [
  {
    locator: { xpath: "scroll" },
    pageId: 0,
    scrollDirection: "down",
    scrollTo: 476,
    type: "scroll"
  },
  {
    locator: {
      href: "http://localhost:5000/login",
      tagName: "a",
      textContent: "form authentication",
      xpath: "//*[@id='content']/ul/li[18]/a"
    },
    pageId: 0,
    type: "click"
  },
  {
    locator: {
      id: "username",
      inputType: "text",
      name: "username",
      tagName: "input",
      xpath: "//*[@id='username']"
    },
    pageId: 0,
    type: "type",
    value: "tomsmith"
  },
  {
    locator: {
      inputType: "submit",
      tagName: "button",
      textContent: " login",
      xpath: "//*[@id='login']/button"
    },
    pageId: 0,
    type: "click"
  },
  {
    locator: {
      id: "username",
      inputType: "text",
      name: "username",
      tagName: "input",
      xpath: "//*[@id='username']"
    },
    pageId: 0,
    type: "type",
    value: "tomsmith"
  },
  {
    locator: {
      id: "password",
      inputType: "password",
      name: "password",
      tagName: "input",
      xpath: "//*[@id='password']"
    },
    pageId: 0,
    type: "type",
    value: "SuperSecretPassword!"
  },
  {
    locator: {
      inputType: "submit",
      tagName: "button",
      textContent: " login",
      xpath: "//*[@id='login']/button"
    },
    pageId: 0,
    type: "click"
  }
];

describe("buildStepsFromActionGroups", () => {
  test("returns correct steps for action groups", async () => {
    const events = await loadEvents("login");
    const actions = findActions(events);
    const actionGroups = groupActions(actions);

    const steps = buildStepsFromActionGroups(actionGroups);

    expect(steps).toMatchObject(finalSteps);
  });
});

describe("eventsToSteps", () => {
  test("returns correct steps for events", async () => {
    const events = await loadEvents("login");

    const steps = eventsToSteps(events);

    expect(steps).toMatchObject(finalSteps);
  });
});
describe("findActions", () => {
  test("returns only click, scroll, and type events", async () => {
    const events = await loadEvents("login");
    expect(events).toHaveLength(146);

    const filteredEvents = findActions(events);
    expect(filteredEvents).toHaveLength(85);
  });
});

describe("formatClickSteps", () => {
  test("returns steps for all clicks if no next group", () => {
    const actionGroup = {
      actions: [
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "click" as "click",
      xpath: "button"
    };

    expect(formatClickSteps(actionGroup, null)).toMatchObject([
      {
        locator: { id: "button" },
        pageId: 0,
        type: "click"
      },
      {
        locator: { id: "button" },
        pageId: 0,
        type: "click"
      }
    ]);
  });

  test("returns steps for all clicks if next group not typing", () => {
    const actionGroup = {
      actions: [
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "click" as "click",
      xpath: "button"
    };

    const nextGroup = {
      actions: [
        {
          data: { y: 100 },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "scroll" as "scroll",
      xpath: "button"
    };

    expect(formatClickSteps(actionGroup, nextGroup)).toMatchObject([
      {
        locator: { id: "button" },
        pageId: 0,
        type: "click"
      },
      {
        locator: { id: "button" },
        pageId: 0,
        type: "click"
      }
    ]);
  });

  test("returns steps for all clicks if next group is different element", () => {
    const actionGroup = {
      actions: [
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "click" as "click",
      xpath: "button"
    };

    const nextGroup = {
      actions: [
        {
          data: {
            properties: {
              id: "anotherButton"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "click" as "click",
      xpath: "anotherButton"
    };

    expect(formatClickSteps(actionGroup, nextGroup)).toMatchObject([
      {
        locator: { id: "button" },
        pageId: 0,
        type: "click"
      },
      {
        locator: { id: "button" },
        pageId: 0,
        type: "click"
      }
    ]);
  });

  test("does not include last click if next group is typing into same element", () => {
    const actionGroup = {
      actions: [
        {
          data: {
            properties: {
              id: "input"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "input"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "click" as "click",
      xpath: "input"
    };

    const nextGroup = {
      actions: [
        {
          data: {
            properties: {
              id: "button"
            },
            text: "spirit"
          },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "type" as "type",
      xpath: "input"
    };

    expect(formatClickSteps(actionGroup, nextGroup)).toMatchObject([
      {
        locator: { id: "input" },
        pageId: 0,
        type: "click"
      }
    ]);
  });
});

describe("formatScrollStep", () => {
  test("returns null if not enough actions", () => {
    const actionGroup = {
      actions: [
        {
          data: { y: 0 }
        } as QAEventWithTime
      ],
      type: "scroll" as "scroll",
      xpath: null
    };

    expect(formatScrollStep(actionGroup)).toBeNull();
  });

  test("returns last scroll step if scrolling down", () => {
    const actionGroup = {
      actions: [
        {
          data: { y: 0 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 150 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 100 },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "scroll" as "scroll",
      xpath: null
    };

    expect(formatScrollStep(actionGroup)).toMatchObject({
      locator: { xpath: "scroll" },
      pageId: 0,
      scrollDirection: "down",
      scrollTo: 100,
      type: "scroll"
    });
  });

  test("returns last scroll step if scrolling up", () => {
    const actionGroup = {
      actions: [
        {
          data: { y: 100 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 150 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 0 },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "scroll" as "scroll",
      xpath: null
    };

    expect(formatScrollStep(actionGroup)).toMatchObject({
      locator: { xpath: "scroll" },
      pageId: 0,
      scrollDirection: "up",
      scrollTo: 0,
      type: "scroll"
    });
  });
});

describe("formatTypeStep", () => {
  test("returns formatted type step", () => {
    const actionGroup = {
      actions: [
        {
          data: {
            properties: {
              id: "username"
            },
            text: "s"
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "username"
            },
            text: "sp"
          },
          pageId: 0
        } as QAEventWithTime
      ],
      type: "type" as "type",
      xpath: "username"
    };

    expect(formatTypeStep(actionGroup)).toMatchObject({
      locator: {
        id: "username"
      },
      pageId: 0,
      type: "type",
      value: "sp"
    });
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
  test("returns actions grouped by element and type", async () => {
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

    expect(actionGroups[5]).toMatchObject({
      type: "click",
      xpath: "//*[@id='username']"
    });
    expect(actionGroups[5].actions).toHaveLength(1);

    expect(actionGroups[6]).toMatchObject({
      type: "type",
      xpath: "//*[@id='username']"
    });
    expect(actionGroups[6].actions).toHaveLength(8);

    expect(actionGroups[7]).toMatchObject({
      type: "click",
      xpath: "//*[@id='password']"
    });
    expect(actionGroups[7].actions).toHaveLength(1);

    expect(actionGroups[8]).toMatchObject({
      type: "type",
      xpath: "//*[@id='password']"
    });
    expect(actionGroups[8].actions).toHaveLength(20);

    expect(actionGroups[9]).toMatchObject({
      type: "click",
      xpath: "//*[@id='login']/button"
    });
    expect(actionGroups[9].actions).toHaveLength(1);
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
