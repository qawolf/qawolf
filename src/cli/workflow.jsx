"use strict";
const importJsx = require("import-jsx");
const { Box, Color } = require("ink");
const React = require("react");

const Steps = importJsx("./steps.jsx");

const getBackgroundForStatus = status => {
  if (status === "runs") {
    return {
      bgYellow: true
    };
  }

  if (status === "pass") {
    return {
      bgGreen: true
    };
  }

  return {
    bgRed: true
  };
};

const Workflow = ({ showSteps, workflow }) => {
  const { name, status } = workflow;

  return (
    <Box flexDirection="column">
      <Box>
        <Color bold {...getBackgroundForStatus(status)} whiteBright>
          {` ${status.toUpperCase()} `}
        </Color>

        <Box marginLeft={1}>
          <Color bold>{name}</Color>
        </Box>
      </Box>
      {!!showSteps && <Steps steps={workflow.steps} />}
    </Box>
  );
};

module.exports = Workflow;
