import { loadEvents } from "@qawolf/fixtures";
import { buildJob } from "./buildJob";
import { buildTest, formatStep } from "./buildTest";

describe("buildTest", () => {
  test("builds a test from a job", async () => {
    const events = await loadEvents("login");
    const job = buildJob(events, "test job");
    const testString = buildTest(job, false);
    expect(testString).toMatchSnapshot();
  });
});

describe("formatStep", () => {
  test("formats click on link step", () => {
    const step = {
      action: "click" as "click",
      locator: {
        tagName: "a",
        textContent: "contact"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual("click contact link");
  });

  test("formats click on submit input step", () => {
    const step = {
      action: "click" as "click",
      locator: {
        inputType: "submit",
        tagName: "input",
        textContent: "sign in"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual('click sign in input[type="submit"]');
  });

  test("formats scroll down action", () => {
    const step = {
      action: "scroll" as "scroll",
      locator: { xpath: "scroll" },
      scrollDirection: "down" as "down"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual("scroll down");
  });

  test("formats scroll up action", () => {
    const step = {
      action: "scroll" as "scroll",
      locator: { xpath: "scroll" },
      scrollDirection: "up" as "up"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual("scroll up");
  });

  test("formats type into text input", () => {
    const step = {
      action: "input" as "input",
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["username"],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "spirit" into username input[type="text"]'
    );
  });

  test("formats type into password input", () => {
    const step = {
      action: "input" as "input",
      locator: {
        id: "input2",
        inputType: "password",
        placeholder: "secret",
        tagName: "input"
      },
      value: "supersecret"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "supersecret" into secret input[type="password"]'
    );
  });

  test("removes newline characters", () => {
    const step = {
      action: "input" as "input",
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["\nusername\n\r"],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "spirit" into username input[type="text"]'
    );
  });

  test("remove excessive whitespace", () => {
    const step = {
      action: "input" as "input",
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["    username    "],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "spirit" into username input[type="text"]'
    );
  });

  test("shortens target name if needed", () => {
    const step = {
      action: "click" as "click",
      locator: {
        inputType: "submit",
        tagName: "input",
        textContent: `sign in${"x".repeat(200)}`
      }
    };

    const formattedTextContent = `sign in${"x".repeat(43)}`;

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      `click ${formattedTextContent} input[type="submit"]`
    );
  });
});
