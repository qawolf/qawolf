import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { getEnvValues } from "../src/getEnvValues";

let workflow: Workflow;

beforeAll(async () => {
  const loginWorkflow = await loadWorkflow("scroll_login");
  workflow = {
    ...loginWorkflow,
    name: "the_login"
  };
});

describe("getEnvValues", () => {
  it("uses environment variables when they are defined", () => {
    process.env.QAW_THE_LOGIN_2 = "envusername";
    let values = getEnvValues(workflow);
    expect(values[2]).toEqual("envusername");
    delete process.env.QAW_THE_LOGIN_2;
    values = getEnvValues(workflow);
    expect(values[2]).toBeUndefined();
  });
});
