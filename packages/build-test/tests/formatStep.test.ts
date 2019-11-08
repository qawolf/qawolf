import { Step } from "@qawolf/types";
import { formatStep } from "../src/formatStep";

describe("formatStep", () => {
  describe("click", () => {
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
  });

  describe("scroll", () => {
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
  });

  describe("select", () => {
    it("formats select action", () => {
      const step: Step = {
        action: "select",
        index: 0,
        target: {
          id: "select1",
          tagName: "select"
        },
        value: "spirit"
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });
  });

  describe("type", () => {
    it("formats clear an input", () => {
      const step: Step = {
        action: "type",
        index: 0,
        target: {
          tagName: "input"
        },
        value: null
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
  });
});
