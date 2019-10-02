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
        locator: {
          inputType: "text",
          name: "username",
          tagName: "input",
          xpath: '//*[@id="username"]'
        },
        sourceEventId: 11,
        type: "type" as "type",
        value: "spirit"
      },
      {
        locator: {
          inputType: "password",
          name: "password",
          tagName: "input",
          xpath: '//*[@id="password"]'
        },
        sourceEventId: 12,
        type: "type" as "type",
        value: "supersecret"
      },
      {
        locator: {
          tagName: "button",
          textContent: "login",
          xpath: '//*[@id="login"]/button'
        },
        sourceEventId: 13,
        type: "click" as "click"
      }
    ];

    const job = {
      name: "Log in",
      steps,
      url: "url"
    };

    const run = createRunFromJob(job);

    expect(run).toMatchObject({
      status: "queued",
      steps: [
        {
          name: "enter spirit into username input[type='text']",
          status: "queued"
        },
        {
          name: "enter supersecret into password input[type='password']",
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
      locator: {
        tagName: "a",
        textContent: "contact"
      },
      sourceEventId: 11,
      type: "click" as "click"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "click contact link",
      status: "queued"
    });
  });

  test("formats click on submit input step", () => {
    const step = {
      locator: {
        inputType: "submit",
        name: "signin",
        tagName: "input",
        textContent: "sign in"
      },
      sourceEventId: 11,
      type: "click" as "click"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "click sign in input[type='submit']",
      status: "queued"
    });
  });

  test("formats scroll down action", () => {
    const step = {
      locator: { xpath: "scroll" },
      scrollDirection: "down" as "down",
      sourceEventId: 11,
      type: "scroll" as "scroll"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "scroll down",
      status: "queued"
    });
  });

  test("formats scroll up action", () => {
    const step = {
      locator: { xpath: "scroll" },
      scrollDirection: "up" as "up",
      sourceEventId: 11,
      type: "scroll" as "scroll"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "scroll up",
      status: "queued"
    });
  });

  test("formats type into text input", () => {
    const step = {
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["username"],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      sourceEventId: 11,
      type: "type" as "type",
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "enter spirit into username input[type='text']",
      status: "queued"
    });
  });

  test("formats type into password input", () => {
    const step = {
      locator: {
        id: "input2",
        inputType: "password",
        placeholder: "secret",
        tagName: "input"
      },
      sourceEventId: 11,
      type: "type" as "type",
      value: "supersecret"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "enter supersecret into secret input[type='password']",
      status: "queued"
    });
  });

  test("removes newline characters", () => {
    const step = {
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["\nusername\n"],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      sourceEventId: 11,
      type: "type" as "type",
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "enter spirit into username input[type='text']",
      status: "queued"
    });
  });

  test("remove excessive whitespace", () => {
    const step = {
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["    username    "],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      sourceEventId: 11,
      type: "type" as "type",
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "enter spirit into username input[type='text']",
      status: "queued"
    });
  });
});
