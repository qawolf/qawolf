import { Step } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { formatStep } from "../src/formatStep";

const doc = htmlToDoc;

let baseStep: Step = {
  action: "click",
  html: {
    ancestors: [],
    node: doc("<a innertext='contact'>contact</a>")
  },
  index: 0,
  isFinal: true,
  page: 0
};

describe("formatStep", () => {
  describe("click", () => {
    it("formats click on link step", () => {
      const formattedStep = formatStep(baseStep);
      expect(formattedStep).toMatchSnapshot();
    });

    it("formats click on submit input step", () => {
      const step: Step = {
        ...baseStep,
        html: {
          ancestors: [],
          node: doc(`<input innertext="someone's" />`)
        },
        index: 1
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });
  });

  describe("scroll", () => {
    it("formats scroll action", () => {
      const step: Step = {
        ...baseStep,
        action: "scroll",
        html: {
          ancestors: [],
          node: doc("<html />")
        },
        value: { x: 0, y: 10 }
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });
  });

  describe("select", () => {
    it("formats select action", () => {
      const step: Step = {
        ...baseStep,
        action: "select",
        html: {
          ancestors: [],
          node: doc("<select name='select1' />")
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
        ...baseStep,
        action: "type",
        html: {
          ancestors: [],
          node: doc("<input />")
        },
        value: null
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });

    it("formats type into text input", () => {
      const step: Step = {
        ...baseStep,
        action: "type",
        html: {
          ancestors: [],
          node: doc(
            `<input id='input1' name='username' placeholder='Jane Doe' />`
          )
        },
        value: "spirit"
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });

    it("formats type into password input", () => {
      const step: Step = {
        ...baseStep,
        action: "type",
        html: {
          ancestors: [],
          node: doc(`<input id='input2' placeholder='secret' />`)
        },
        index: 10,
        value: "supersecret"
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });
  });
});
