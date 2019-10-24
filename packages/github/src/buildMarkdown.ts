import {
  AggregatedResult,
  AssertionResult,
  TestResult
} from "@jest/test-result";

export const buildMarkdown = (results: AggregatedResult): string => {
  const markdown: string[] = [];

  if (results.numFailedTestSuites) {
    markdown.push(`<h2>${results.numFailedTests} Failed</h2>`);
  }

  results.testResults.forEach(testResult => {
    if (testResult.numFailingTests) {
      markdown.push(buildWorkflowMarkdown(testResult));
    }
  });

  if (results.numPassedTestSuites) {
    markdown.push(`<h2>${results.numPassedTestSuites} Passed</h2>`);
  }

  results.testResults.forEach(testResult => {
    if (!testResult.numFailingTests) {
      markdown.push(buildWorkflowMarkdown(testResult));
    }
  });

  return markdown.join("");
};

const buildStepsMarkdown = (assertionResults: AssertionResult[]): string => {
  const markdown: string[] = ["<br /><b>Steps</b><br /><ol>"];

  assertionResults.forEach(result => {
    const emoji = result.status === "passed" ? ":white_check_mark:" : ":x:";
    const stepName =
      result.status === "pending" ? `<s>${result.title}</s>` : result.title;

    markdown.push(`<li>${emoji} ${stepName}</li>`);
  });

  markdown.push("</ol>");

  return markdown.join("");
};

const buildWorkflowMarkdown = (testResult: TestResult): string => {
  const emoji = testResult.numFailingTests ? ":x:" : ":white_check_mark:";

  const testName = getTestNameFromFile(testResult.testFilePath);
  const steps = buildStepsMarkdown(testResult.testResults);

  return `<details><summary>${emoji} ${testName}</summary>${steps}</details>`;
};

const getTestNameFromFile = (testFilePath: string): string => {
  const splitFilePath = testFilePath.split("/");
  const fileName = splitFilePath[splitFilePath.length - 1];
  const fileNameWithoutExtension = fileName.split(".test")[0];

  return fileNameWithoutExtension;
};
