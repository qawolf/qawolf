"use strict";
const React = require("react");
const { Box, Color } = require("ink");

const formatStatus = status => {
  if (status === "runs") {
    return "  runs  ";
  }
  if (status === "ok") {
    return "   ok   ";
  }

  return " broken ";
};

const getBackgroundForStatus = status => {
  if (status === "runs") {
    return {
      bgYellow: true
    };
  }

  if (status === "ok") {
    return {
      bgGreen: true
    };
  }

  return {
    bgRed: true
  };
};

const Run = ({ name, status }) => {
  return (
    <Box>
      <Color bold {...getBackgroundForStatus(status)} whiteBright>
        {` ${formatStatus(status).toUpperCase()} `}
      </Color>

      <Box marginLeft={1}>
        <Color bold>{name}</Color>
      </Box>
    </Box>
  );
};

module.exports = Run;
