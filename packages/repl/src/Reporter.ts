import { AggregatedResult, AssertionResult } from "@jest/test-result";
import { red, green } from "kleur";

export class Reporter {
  _globalConfig: any;
  _options: any;

  constructor(globalConfig: any, options: any) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  logAssertionResult(result: AssertionResult) {
    if (result.status === "passed") {
      console.log(green("pass:"), result.fullName);
    } else if (result.status === "failed") {
      console.log(red("fail:"), result.fullName);
    }
    result.failureMessages.forEach(message => console.log(message));
  }

  onRunComplete(_: any, aggregatedResult: AggregatedResult) {
    console.log();
    aggregatedResult.testResults.forEach(testResult => {
      if (testResult.failureMessage) {
        console.log(testResult.failureMessage);
      }

      testResult.testResults.forEach(assertionResult =>
        this.logAssertionResult(assertionResult)
      );
    });
  }
}
