import { Size } from "../browser/device";
import { buildRuns, createRunFromJob, formatStep } from "./cli";

describe("buildRuns", () => {
  test("creates runs object without summary if run not complete", () => {
    const startTime = Date.now();
    const run = {
      name: "Log in",
      status: "runs" as "runs",
      startTime,
      steps: []
    };
    const runs = buildRuns(run);

    expect(runs).toMatchObject({
      runs: [run],
      summary: null
    });
  });

  test("creates runs object with passing summary if run passed", () => {
    const startTime = Date.now();
    const run = {
      name: "Log in",
      status: "pass" as "runs",
      startTime,
      steps: []
    };
    const runs = buildRuns(run);

    expect(runs).toMatchObject({
      runs: [run],
      summary: { fail: 0, pass: 1, total: 1 }
    });
  });

  test("creates runs object with failing summary if run failed", () => {
    const startTime = Date.now();
    const run = {
      name: "Log in",
      status: "fail" as "runs",
      startTime,
      steps: []
    };
    const runs = buildRuns(run);

    expect(runs).toMatchObject({
      runs: [run],
      summary: { fail: 1, pass: 0, total: 1 }
    });
  });
});

describe("createRunFromJob", () => {
  test("creates run object from job", () => {
    const steps = [
      {
        action: "type" as "type",
        locator: {
          inputType: "text",
          name: "username",
          tagName: "input",
          xpath: '//*[@id="username"]'
        },
        value: "spirit"
      },
      {
        action: "type" as "type",
        locator: {
          inputType: "password",
          name: "password",
          tagName: "input",
          xpath: '//*[@id="password"]'
        },
        value: "supersecret"
      },
      {
        action: "click" as "click",
        locator: {
          tagName: "button",
          textContent: "login",
          xpath: '//*[@id="login"]/button'
        }
      }
    ];

    const job = {
      name: "Log in",
      steps,
      size: "desktop" as Size,
      url: "url"
    };

    const run = createRunFromJob(job);

    expect(run).toMatchObject({
      status: "queued",
      steps: [
        {
          name: 'enter "spirit" into username input[type="text"]',
          status: "queued"
        },
        {
          name: 'enter "supersecret" into password input[type="password"]',
          status: "queued"
        },
        {
          name: "click login button",
          status: "queued"
        }
      ],
      name: "Log in"
    });
    expect(run.startTime).toBeTruthy();
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
    expect(formattedStep).toEqual({
      name: "click contact link",
      status: "queued"
    });
  });

  test("formats click on submit input step", () => {
    const step = {
      action: "click" as "click",
      locator: {
        inputType: "submit",
        name: "signin",
        tagName: "input",
        textContent: "sign in"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: 'click sign in input[type="submit"]',
      status: "queued"
    });
  });

  test("formats scroll down action", () => {
    const step = {
      action: "scroll" as "scroll",
      locator: { xpath: "scroll" },
      scrollDirection: "down" as "down"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "scroll down",
      status: "queued"
    });
  });

  test("formats scroll up action", () => {
    const step = {
      action: "scroll" as "scroll",
      locator: { xpath: "scroll" },
      scrollDirection: "up" as "up"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "scroll up",
      status: "queued"
    });
  });

  test("formats type into text input", () => {
    const step = {
      action: "type" as "type",
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
    expect(formattedStep).toEqual({
      name: 'enter "spirit" into username input[type="text"]',
      status: "queued"
    });
  });

  test("formats type into password input", () => {
    const step = {
      action: "type" as "type",
      locator: {
        id: "input2",
        inputType: "password",
        placeholder: "secret",
        tagName: "input"
      },
      value: "supersecret"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: 'enter "supersecret" into secret input[type="password"]',
      status: "queued"
    });
  });

  test("removes newline characters", () => {
    const step = {
      action: "type" as "type",
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
    expect(formattedStep).toEqual({
      name: 'enter "spirit" into username input[type="text"]',
      status: "queued"
    });
  });

  test("remove excessive whitespace", () => {
    const step = {
      action: "type" as "type",
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
    expect(formattedStep).toEqual({
      name: 'enter "spirit" into username input[type="text"]',
      status: "queued"
    });
  });
});
