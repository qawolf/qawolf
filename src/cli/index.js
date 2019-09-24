"use strict";
const importJsx = require("import-jsx");

const renderRuns = importJsx("./Runs.jsx");

const props = {
  startTime: "2019-09-23T20:06:43.753Z",
  summary: {
    fail: 1,
    pass: 2,
    total: 3
  },
  runs: [
    {
      name: "Sign in and out",
      status: "fail",
      steps: [
        {
          name: "type 'spirit' into username input",
          status: "pass"
        },
        {
          name: "type 'secret' into password input",
          status: "pass"
        },
        {
          name: "click sign in button",
          status: "fail"
        },
        {
          name: "click sign out button",
          status: "unreached"
        }
      ]
    },
    {
      name: "Create and delete project",
      status: "pass",
      steps: [
        {
          name: "type 'spirit' into username input",
          status: "pass"
        },
        {
          name: "type 'secret' into password input",
          status: "pass"
        },
        {
          name: "click sign in button",
          status: "pass"
        },
        {
          name: "click sign out button",
          status: "pass"
        }
      ]
    },
    {
      name: "Enter giveaway",
      status: "pass",
      steps: [
        {
          name: "type 'spirit' into username input",
          status: "pass"
        },
        {
          name: "type 'secret' into password input",
          status: "pass"
        },
        {
          name: "click sign in button",
          status: "pass"
        },
        {
          name: "click sign out button",
          status: "pass"
        }
      ]
    },
    {
      name: "Add to cart",
      status: "pass",
      steps: [
        {
          name: "type 'spirit' into username input",
          status: "pass"
        },
        {
          name: "type 'secret' into password input",
          status: "pass"
        },
        {
          name: "click sign in button",
          status: "runs"
        },
        {
          name: "click sign out button",
          status: "queued"
        }
      ]
    }
  ]
};

renderRuns(props);

module.exports = renderRuns;
