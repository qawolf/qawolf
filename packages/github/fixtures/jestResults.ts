import { AggregatedResult } from "@jest/test-result";

export const jestResults: AggregatedResult = {
  numFailedTestSuites: 1,
  numFailedTests: 1,
  numPassedTestSuites: 1,
  numPassedTests: 5,
  numPendingTestSuites: 0,
  numPendingTests: 1,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 2,
  numTotalTests: 7,
  openHandles: [],
  snapshot: {
    added: 0,
    didUpdate: false,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0
  },
  startTime: 1571938310122,
  success: false,
  testResults: [
    {
      failureMessage: null,
      numFailingTests: 0,
      numPassingTests: 3,
      numPendingTests: 0,
      numTodoTests: 0,
      openHandles: [],
      perfStats: [] as any,
      snapshot: [] as any,
      testFilePath:
        "/Users/laura/Desktop/qawolf/qawolf/packages/cli/.qawolf/tests/success.test.ts",
      testResults: [
        {
          ancestorTitles: ["success"],
          duration: 4,
          failureMessages: [],
          fullName: "success step 1",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 1"
        },
        {
          ancestorTitles: ["success"],
          duration: 1,
          failureMessages: [],
          fullName: "success step 2",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 2"
        },
        {
          ancestorTitles: ["success"],
          duration: 0,
          failureMessages: [],
          fullName: "success step 3",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 3"
        }
      ],
      skipped: false,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined,
      console: undefined
    },
    {
      failureMessage:
        "\u001b[1m\u001b[31m  \u001b[1m● \u001b[1msuccess › step 3\u001b[39m\u001b[22m\n" +
        "\n" +
        "    demogorgon!\n" +
        "\u001b[2m\u001b[22m\n" +
        "\u001b[2m    \u001b[0m \u001b[90m  5 | \u001b[39m\u001b[0m\u001b[22m\n" +
        '\u001b[2m    \u001b[0m \u001b[90m  6 | \u001b[39m  it(\u001b[32m"step 3"\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n' +
        '\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[2m\u001b[39m\u001b[90m  7 | \u001b[39m    \u001b[36mthrow\u001b[39m \u001b[36mnew\u001b[39m \u001b[33mError\u001b[39m(\u001b[32m"demogorgon!"\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n' +
        "\u001b[2m    \u001b[0m \u001b[90m    | \u001b[39m          \u001b[31m\u001b[1m^\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n" +
        "\u001b[2m    \u001b[0m \u001b[90m  8 | \u001b[39m  })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n" +
        "\u001b[2m    \u001b[0m \u001b[90m  9 | \u001b[39m\u001b[0m\u001b[22m\n" +
        '\u001b[2m    \u001b[0m \u001b[90m 10 | \u001b[39m  it(\u001b[32m"step 4"\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {})\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n' +
        "\u001b[2m\u001b[22m\n" +
        "\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[2m\u001b[0m\u001b[36m.qawolf/tests/failure.test.ts\u001b[39m\u001b[0m\u001b[2m:7:11)\u001b[2m\u001b[22m\n",
      numFailingTests: 1,
      numPassingTests: 2,
      numPendingTests: 1,
      numTodoTests: 0,
      openHandles: [],
      perfStats: [] as any,
      snapshot: [] as any,
      testFilePath:
        "/Users/laura/Desktop/qawolf/qawolf/packages/cli/.qawolf/tests/failure.test.ts",
      testResults: [
        {
          ancestorTitles: ["failure"],
          duration: 3,
          failureMessages: [],
          fullName: "failure step 1",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 1"
        },
        {
          ancestorTitles: ["failure"],
          duration: 1,
          failureMessages: [],
          fullName: "failure step 2",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 2"
        },
        {
          ancestorTitles: ["failure"],
          duration: 3,
          failureMessages: ["failure"],
          fullName: "failure step 3",
          location: null,
          numPassingAsserts: 0,
          status: "failed",
          title: "step 3"
        },
        {
          ancestorTitles: ["failure"],
          duration: 0,
          failureMessages: [],
          fullName: "failure step 4",
          location: null,
          numPassingAsserts: 0,
          status: "pending",
          title: "step 4"
        }
      ],
      skipped: false,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined,
      console: undefined
    }
  ],
  wasInterrupted: false
};

export const jestResultsSingleFailed: AggregatedResult = {
  numFailedTestSuites: 1,
  numFailedTests: 1,
  numPassedTestSuites: 0,
  numPassedTests: 2,
  numPendingTestSuites: 0,
  numPendingTests: 1,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 1,
  numTotalTests: 4,
  openHandles: [],
  snapshot: {
    added: 0,
    didUpdate: false,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0
  },
  startTime: 1571956916316,
  success: false,
  testResults: [
    {
      console: undefined,
      failureMessage:
        "\u001b[1m\u001b[31m  \u001b[1m● \u001b[1mfailure › step 3\u001b[39m\u001b[22m\n" +
        "\n" +
        "    demogorgon!\n" +
        "\u001b[2m\u001b[22m\n" +
        "\u001b[2m    \u001b[0m \u001b[90m  5 | \u001b[39m\u001b[0m\u001b[22m\n" +
        '\u001b[2m    \u001b[0m \u001b[90m  6 | \u001b[39m  it(\u001b[32m"step 3"\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n' +
        '\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[2m\u001b[39m\u001b[90m  7 | \u001b[39m    \u001b[36mthrow\u001b[39m \u001b[36mnew\u001b[39m \u001b[33mError\u001b[39m(\u001b[32m"demogorgon!"\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n' +
        "\u001b[2m    \u001b[0m \u001b[90m    | \u001b[39m          \u001b[31m\u001b[1m^\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n" +
        "\u001b[2m    \u001b[0m \u001b[90m  8 | \u001b[39m  })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n" +
        "\u001b[2m    \u001b[0m \u001b[90m  9 | \u001b[39m\u001b[0m\u001b[22m\n" +
        '\u001b[2m    \u001b[0m \u001b[90m 10 | \u001b[39m  it(\u001b[32m"step 4"\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {})\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n' +
        "\u001b[2m\u001b[22m\n" +
        "\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[2m\u001b[0m\u001b[36m.qawolf/tests/failure.test.ts\u001b[39m\u001b[0m\u001b[2m:7:11)\u001b[2m\u001b[22m\n",
      numFailingTests: 1,
      numPassingTests: 2,
      numPendingTests: 1,
      numTodoTests: 0,
      openHandles: [],
      perfStats: [] as any,
      snapshot: [] as any,
      testFilePath:
        "/Users/laura/Desktop/qawolf/qawolf/packages/cli/.qawolf/tests/failure.test.ts",
      testResults: [
        {
          ancestorTitles: ["failure"],
          duration: 0,
          failureMessages: [],
          fullName: "failure step 1",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 1"
        },
        {
          ancestorTitles: ["failure"],
          duration: 0,
          failureMessages: [],
          fullName: "failure step 2",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 2"
        },
        {
          ancestorTitles: ["failure"],
          duration: 1,
          failureMessages: [
            "Error: demogorgon!\n" +
              "    at Object.<anonymous> (/Users/laura/Desktop/qawolf/qawolf/packages/cli/.qawolf/tests/failure.test.ts:7:11)\n" +
              "    at Object.asyncJestTest (/Users/laura/Desktop/qawolf/qawolf/packages/cli/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:101:37)\n" +
              "    at /Users/laura/Desktop/qawolf/qawolf/packages/cli/node_modules/jest-jasmine2/build/queueRunner.js:43:12\n" +
              "    at new Promise (<anonymous>)\n" +
              "    at mapper (/Users/laura/Desktop/qawolf/qawolf/packages/cli/node_modules/jest-jasmine2/build/queueRunner.js:26:19)\n" +
              "    at /Users/laura/Desktop/qawolf/qawolf/packages/cli/node_modules/jest-jasmine2/build/queueRunner.js:73:41"
          ],
          fullName: "failure step 3",
          location: null,
          numPassingAsserts: 0,
          status: "failed",
          title: "step 3"
        },
        {
          ancestorTitles: ["failure"],
          duration: 0,
          failureMessages: [],
          fullName: "failure step 4",
          location: null,
          numPassingAsserts: 0,
          status: "pending",
          title: "step 4"
        }
      ],
      skipped: false,
      displayName: undefined,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined
    }
  ],
  wasInterrupted: false
};

export const jestResultsSinglePassed: AggregatedResult = {
  numFailedTestSuites: 0,
  numFailedTests: 0,
  numPassedTestSuites: 1,
  numPassedTests: 3,
  numPendingTestSuites: 0,
  numPendingTests: 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 1,
  numTotalTests: 3,
  openHandles: [],
  snapshot: {
    added: 0,
    didUpdate: false,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0
  },
  startTime: 1571956676781,
  success: true,
  testResults: [
    {
      console: undefined,
      failureMessage: null,
      numFailingTests: 0,
      numPassingTests: 3,
      numPendingTests: 0,
      numTodoTests: 0,
      openHandles: [],
      perfStats: [] as any,
      snapshot: [] as any,
      testFilePath:
        "/Users/laura/Desktop/qawolf/qawolf/packages/cli/.qawolf/tests/success.test.ts",
      testResults: [
        {
          ancestorTitles: ["success"],
          duration: 2,
          failureMessages: [],
          fullName: "success step 1",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 1"
        },
        {
          ancestorTitles: ["success"],
          duration: 0,
          failureMessages: [],
          fullName: "success step 2",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 2"
        },
        {
          ancestorTitles: ["success"],
          duration: 0,
          failureMessages: [],
          fullName: "success step 3",
          location: null,
          numPassingAsserts: 0,
          status: "passed",
          title: "step 3"
        }
      ],
      skipped: false,
      displayName: undefined,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined
    }
  ],
  wasInterrupted: false
};
