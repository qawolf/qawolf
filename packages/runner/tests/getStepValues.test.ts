import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { getStepValues } from "../src/getStepValues";

let workflow: Workflow;

beforeAll(async () => {
  const loginWorkflow = await loadWorkflow("scroll_login");
  workflow = {
    ...loginWorkflow,
    name: "the_login"
  };
});

describe("getStepValues", () => {
  it("uses environment variables when they are defined", () => {
    process.env.QAW_THE_LOGIN_2 = "envusername";
    let values = getStepValues(workflow);
    expect(values[2]).toEqual("envusername");
    expect(values[4]).toEqual(workflow.steps[4].value);
    delete process.env.QAW_THE_LOGIN_2;
    values = getStepValues(workflow);
    expect(values[2]).toEqual(workflow.steps[2].value);
  });
});
