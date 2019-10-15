import { getUrl } from "../src/getUrl";
import { loginJob } from "../../build-job/fixtures/loginJob";

describe("getUrl", () => {
  it("uses test environment variable if it is defined", () => {
    process.env.QAW_LOGIN_URL = "http://QAW_LOGIN_URL";
    let url = getUrl(loginJob);
    expect(url).toEqual("http://QAW_LOGIN_URL");
    delete process.env.QAW_LOGIN_URL;
    url = getUrl(loginJob);
    expect(url).toEqual(loginJob.url);
  });

  it("uses QAW_URL variable if it is defined", () => {
    process.env.QAW_URL = "http://QAW_URL";
    let url = getUrl(loginJob);
    expect(url).toEqual("http://QAW_URL");

    // make sure it prioritizes the test url
    process.env.QAW_LOGIN_URL = "http://QAW_LOGIN_URL";
    url = getUrl(loginJob);
    expect(url).toEqual("http://QAW_LOGIN_URL");

    delete process.env.QAW_URL;
    delete process.env.QAW_LOGIN_URL;
    url = getUrl(loginJob);
    expect(url).toEqual(loginJob.url);
  });
});
