import { Step } from "@qawolf/types";
import { formatStep } from "../src/formatStep";

describe("formatStep", () => {
  describe("click", () => {
    it("formats click on link step", () => {
      const step: Step = {
        action: "click",
        html: {
          ancestors: [],
          node: {
            attrs: { innertext: "contact" },
            children: [],
            name: "a",
            type: "tag"
          }
        },
        index: 0,
        page: 0
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });

    it("formats click on submit input step", () => {
      const step: Step = {
        action: "click",
        html: {
          ancestors: [],
          node: {
            attrs: { innertext: "someone's" },
            children: [],
            name: "input",
            type: "tag"
          }
        },
        index: 1,
        page: 0
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });
  });

  describe("scroll", () => {
    it("formats scroll action", () => {
      const step: Step = {
        action: "scroll",
        html: {
          ancestors: [],
          node: {
            children: [],
            name: "html",
            type: "tag"
          }
        },
        index: 0,
        page: 0,
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
        html: {
          ancestors: [],
          node: {
            attrs: {
              name: "select1"
            },
            children: [],
            name: "select",
            type: "tag"
          }
        },
        index: 0,
        page: 0,
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
        html: {
          ancestors: [],
          node: {
            children: [],
            name: "input",
            type: "tag"
          }
        },
        index: 0,
        page: 0,
        value: null
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });

    it("formats type into text input", () => {
      const step: Step = {
        action: "type",
        html: {
          ancestors: [],
          node: {
            attrs: {
              id: "input1",
              name: "username",
              placeholder: "Jane Doe"
            },
            children: [],
            name: "input",
            type: "tag"
          }
        },
        index: 0,
        page: 0,
        value: "spirit"
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });

    it("formats type into password input", () => {
      const step: Step = {
        action: "type",
        html: {
          ancestors: [],
          node: {
            attrs: {
              id: "input2",
              placeholder: "secret"
            },
            children: [],
            name: "input",
            type: "tag"
          }
        },
        index: 10,
        page: 0,
        value: "supersecret"
      };

      const formattedStep = formatStep(step);
      expect(formattedStep).toMatchSnapshot();
    });
  });
});
