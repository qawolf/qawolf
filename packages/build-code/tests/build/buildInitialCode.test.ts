import { buildInitialCode } from "../../src/build";
import { CREATE_CODE_SYMBOL } from "../../src/CodeUpdater";

const launchOptions = {
  createCodeSymbol: CREATE_CODE_SYMBOL,
  name: "login",
  url: "http://localhost"
};

describe("buildInitialCode", () => {
  it("builds a script for a workflow", async () => {
    let code = buildInitialCode({
      ...launchOptions,
      isTest: false
    });
    expect(code).toMatchSnapshot();

    code = buildInitialCode({
      ...launchOptions,
      device: "iPhone 7",
      isTest: false
    });
    expect(code).toMatchSnapshot();
  });

  it("builds a test for a workflow", async () => {
    let code = buildInitialCode({ ...launchOptions, isTest: true });
    expect(code).toMatchSnapshot();

    code = buildInitialCode({
      ...launchOptions,
      device: "iPhone 7",
      isTest: true
    });
    expect(code).toMatchSnapshot();
  });
});
