import { getUrl } from "../src/getUrl";
import { loginJob } from "../../build-job/fixtures/loginJob";

describe("getUrl", () => {
  it("uses environment variable when it is defined", () => {
    process.env.QAW_LOGIN_URL = "http://anotherurl";
    let url = getUrl(loginJob);
    expect(url).toEqual("http://anotherurl");
    delete process.env.QAW_LOGIN_URL;
    url = getUrl(loginJob);
    expect(url).toEqual(loginJob.url);
  });
});
