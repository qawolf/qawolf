import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { StepExpression } from "../src/StepExpression";

const doc = htmlToDoc;

export const baseStep = {
  action: "click" as Action,
  html: {
    ancestors: [],
    node: doc("<input id='my-input' data-qa='test-input' />")
  },
  index: 0,
  page: 0
};

export const stepExpression = new StepExpression(baseStep);
