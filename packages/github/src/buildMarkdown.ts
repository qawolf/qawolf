import { AggregatedResult, TestResult } from "@jest/test-result";
import { readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";

type FormattedTest = {
  name: string;
  steps: Array<{ emoji: string; name: string; strikethrough: boolean }>;
};

const markdownTemplate = compile(
  readFileSync(resolve(__dirname, "../static/markdown.hbs"), "utf8")
);

export const buildMarkdown = (results: AggregatedResult): string => {
  const failedTests: FormattedTest[] = [];
  const passedTests: FormattedTest[] = [];

  results.testResults.forEach(testResult => {
    const test = formatTest(testResult);

    if (testResult.numFailingTests) {
      failedTests.push(test);
    } else {
      passedTests.push(test);
    }
  });

  const markdown = markdownTemplate({
    failedCount: results.numFailedTestSuites || null,
    failedTests,
    passedCount: results.numPassedTestSuites || null,
    passedTests
  });

  return markdown;
};

const formatTest = (result: TestResult): FormattedTest => {
  const steps = result.testResults.map(step => {
    const emoji = step.status === "passed" ? ":white_check_mark:" : ":x:";

    return {
      emoji,
      name: step.title,
      strikethrough: step.status === "pending"
    };
  });

  return {
    name: getTestNameFromFile(result.testFilePath),
    steps
  };
};

const getTestNameFromFile = (testFilePath: string): string => {
  const splitFilePath = testFilePath.split("/");
  const fileName = splitFilePath[splitFilePath.length - 1];
  const fileNameWithoutExtension = fileName.split(".test")[0];

  return fileNameWithoutExtension;
};
