import { createRunFromJob, formatStep } from "./cli";

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
        type: "type" as "type",
        value: "supersecret"
      },
      {
        locator: {
          tagName: "button",
          textContent: "login",
          xpath: '//*[@id="login"]/button'
        },
        type: "click" as "click"
      }
    ];

    const job = {
      href: "href",
      name: "Log in",
      steps
    };

    const run = createRunFromJob(job);

    expect(run).toEqual({
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
  });
});

describe("formatStep", () => {
  test("formats click on link step", () => {
    const step = {
      locator: {
        tagName: "a",
        textContent: "contact"
      },
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
      type: "click" as "click"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "click sign in input[type='submit']",
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
      type: "type" as "type",
      value: "supersecret"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual({
      name: "enter supersecret into secret input[type='password']",
      status: "queued"
    });
  });
});
