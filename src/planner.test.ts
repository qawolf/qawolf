import { loadEvents } from "@qawolf/fixtures";
import {
  filterEvents,
  findHref,
  planClickSteps,
  planTypeSteps
} from "./planner";

describe("findHref", () => {
  test("returns href of events", async () => {
    const events = await loadEvents("login");

    expect(findHref(events)).toBe("http://localhost:5000/");
  });
});

describe("planClickSteps", () => {
  test("returns click steps from events", async () => {
    const events = await loadEvents("login");
    const filteredEvents = filterEvents(events);
    console.log("EVENTS", filteredEvents);

    const steps = planClickSteps(filteredEvents);

    expect(steps).toMatchObject([
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
          inputType: "submit",
          tagName: "button",
          textContent: " login",
          xpath: "//*[@id='login']/button"
        },
        pageId: 0,
        type: "click"
      }
    ]);
  });
});

describe("planTypeSteps", () => {
  test("returns type steps from events", async () => {
    const events = await loadEvents("login");
    const filteredEvents = filterEvents(events);

    const steps = planTypeSteps(filteredEvents);

    expect(steps).toMatchObject([
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
      }
    ]);
  });
});
