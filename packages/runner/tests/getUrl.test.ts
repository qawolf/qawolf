import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { getUrl } from "../src/getUrl";

let workflow: Workflow;

beforeAll(async () => {
  const loginWorkflow = await loadWorkflow("scroll_login");
  workflow = {
    ...loginWorkflow,
    name: "the_login"
  };
});

describe("getUrl", () => {
  it("uses test environment variable if it is defined", () => {
    process.env.QAW_THE_LOGIN_URL = "http://QAW_THE_LOGIN_URL";
    let url = getUrl(workflow);
    expect(url).toEqual("http://QAW_THE_LOGIN_URL");
    delete process.env.QAW_THE_LOGIN_URL;
    url = getUrl(workflow);
    expect(url).toEqual(workflow.url);
  });

  it("uses QAW_URL variable if it is defined", () => {
    process.env.QAW_URL = "http://QAW_URL";
    let url = getUrl(workflow);
    expect(url).toEqual("http://QAW_URL");

    // make sure it prioritizes the test url
    process.env.QAW_THE_LOGIN_URL = "http://QAW_THE_LOGIN_URL";
    url = getUrl(workflow);
    expect(url).toEqual("http://QAW_THE_LOGIN_URL");

    delete process.env.QAW_URL;
    delete process.env.QAW_THE_LOGIN_URL;
    url = getUrl(workflow);
    expect(url).toEqual(workflow.url);
  });
});
