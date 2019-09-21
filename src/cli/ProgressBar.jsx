"use strict";
const { Box, Color } = require("ink");
const React = require("react");

const LENGTH = 40; // characters

const ProgressBar = ({ completeCount, totalCount }) => {
  const completeLength = Math.round((completeCount / totalCount) * LENGTH);
  const remainingLength = LENGTH - completeLength;

  return (
    <Box flexDirection="row">
      {"\n"}
      <Color bgCyan>{" ".repeat(completeLength)}</Color>
      <Color inverse>{" ".repeat(remainingLength)}</Color>
    </Box>
  );
};

module.exports = ProgressBar;
