import { Step } from "@qawolf/types";
// import directly since fixtures are not exported
import { loginWorkflow } from "../../build-workflow/fixtures/loginWorkflow";
import {
  buildTest,
  formatIt,
  formatMethod,
  formatStep
} from "../src/buildTest";

describe("buildTest", () => {
  it("builds a test from a workflow", async () => {
    const testString = buildTest(loginWorkflow);
    expect(testString).toMatchSnapshot();
  });
});

describe("formatIt", () => {
  it("formats labels", () => {
    const step: Step = {
      action: "type",
      index: 0,
      target: {
        labels: ["name", "username"],
        name: "other",
        tagName: "input"
      }
    };

    expect(formatIt(step)).toBe('can input "name username" input');
  });
});

describe("formatMethod", () => {
  it("throws error if invalid step action", () => {
    expect(() => {
      formatMethod("drag" as any, 0);
    }).toThrowError();
  });
});

describe("formatStep", () => {
  it("formats click on link step", () => {
    const step: Step = {
      action: "click",
      index: 0,
      target: {
        innerText: "contact",
        tagName: "a"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toMatchSnapshot();
  });

  it("formats click on submit input step", () => {
    const step: Step = {
      action: "click",
      index: 1,
      target: {
        innerText: "sign in",
        inputType: "submit",
        tagName: "input"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toMatchSnapshot();
  });

  it("formats scroll action", () => {
    const step: Step = {
      action: "scroll",
      index: 0,
      target: { xpath: "/html" },
      value: { x: 0, y: 10 }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toMatchSnapshot();
  });

  it("formats type into text input", () => {
    const step: Step = {
      action: "type",
      index: 0,
      target: {
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
    expect(formattedStep).toMatchSnapshot();
  });

  it("formats type into password input", () => {
    const step: Step = {
      action: "type",
      index: 10,
      target: {
        id: "input2",
        inputType: "password",
        placeholder: "secret",
        tagName: "input"
      },
      value: "supersecret"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toMatchSnapshot();
  });

  it("shortens target name if needed", () => {
    const step: Step = {
      action: "click",
      index: 0,
      target: {
        inputType: "submit",
        tagName: "input",
        innerText: `sign in${"x".repeat(200)}`
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toMatchSnapshot();
  });

  it("excludes target name if it does not exist", () => {
    const step: Step = {
      action: "click",
      index: 0,
      target: {
        inputType: "submit",
        tagName: "input"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toMatchSnapshot();
  });
});
