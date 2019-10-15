import { getStepValues } from "../src/getStepValues";
import { loginJob } from "../../build-job/fixtures/loginJob";

describe("getStepValues", () => {
  it("uses environment variables when they are defined", () => {
    process.env.QAW_LOGIN_2 = "envusername";
    let values = getStepValues(loginJob);
    expect(values[2]).toEqual("envusername");
    expect(values[4]).toEqual("tomsmith");
    delete process.env.QAW_LOGIN_2;
    values = getStepValues(loginJob);
    expect(values[2]).toEqual("tomsmith");
  });
});
