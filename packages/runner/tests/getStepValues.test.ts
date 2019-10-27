import { loginWorkflow } from "../../build-workflow/fixtures/loginWorkflow";
import { getStepValues } from "../src/getStepValues";

describe("getStepValues", () => {
  it("uses environment variables when they are defined", () => {
    const workflow = {
      ...loginWorkflow,
      name: "the_login"
    };

    process.env.QAW_THE_LOGIN_2 = "envusername";
    let values = getStepValues(workflow);
    expect(values[2]).toEqual("envusername");
    expect(values[4]).toEqual("tomsmith");
    delete process.env.QAW_THE_LOGIN_2;
    values = getStepValues(workflow);
    expect(values[2]).toEqual("tomsmith");
  });
});
