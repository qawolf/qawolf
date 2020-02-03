import { AggregatedResult } from "@jest/test-result";
import { red, green } from "kleur";

export class Reporter {
  /**
   * The default Jest reporter interferes with the REPL.
   * We create a basic reporter here that does not.
   */
  _globalConfig: any;
  _options: any;

  constructor(globalConfig: any, options: any) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(_: any, aggregatedResult: AggregatedResult) {
    // line break
    console.log("");

    aggregatedResult.testResults.forEach(testResult => {
      if (testResult.failureMessage) {
        console.log(testResult.failureMessage);
      }

      testResult.testResults.forEach(assertionResult => {
        if (assertionResult.status === "passed") {
          console.log(green("pass:"), assertionResult.fullName);
        } else if (assertionResult.status === "failed") {
          console.log(red("fail:"), assertionResult.fullName);
        }

        assertionResult.failureMessages.forEach(message =>
          console.log(message)
        );
      });
    });
  }
}
