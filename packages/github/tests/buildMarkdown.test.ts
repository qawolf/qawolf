import { buildMarkdown } from "../src/buildMarkdown";
import {
  jestResults,
  jestResultsSingleFailed,
  jestResultsSinglePassed
} from "../fixtures/jestResults";

describe("buildMarkdown", () => {
  it("returns correct markdown for test suite with single failed test", async () => {
    const markdown = buildMarkdown(jestResultsSingleFailed);

    expect(markdown).toMatchSnapshot();
  });

  it("returns correct markdown for test suite with single passed test", async () => {
    const markdown = buildMarkdown(jestResultsSinglePassed);

    expect(markdown).toMatchSnapshot();
  });

  it("returns correct markdown for test suite with multiple tests", async () => {
    const markdown = buildMarkdown(jestResults);

    expect(markdown).toMatchSnapshot();
  });
});
