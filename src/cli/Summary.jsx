"use strict";
const { Box, Color } = require("ink");
const React = require("react");

const WIDTH = 7;

const formatElapsedTime = startTime => {
  const elapsedSeconds = (new Date() - new Date(startTime)) / 1000;
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  return `${elapsedMinutes}m ${remainingSeconds.toFixed(2)}s`;
};

const Summary = ({ startTime, summary }) => {
  if (!summary) return null;

  return (
    <Box flexDirection="column">
      {"\n"}
      <Box flexDirection="row">
        <Box width={WIDTH}>
          <Color bold>{"Tests:"}</Color>
        </Box>
        {!!summary.fail && <Color bold red>{`${summary.fail} failed`}</Color>}
        {!!summary.fail && ", "}
        {!!summary.pass && <Color bold green>{`${summary.pass} passed`}</Color>}
        {!!summary.pass && ", "}
        {`${summary.total} total`}
      </Box>
      <Box flexDirection="row">
        <Box width={WIDTH}>
          <Color bold>{"Time: "}</Color>
        </Box>
        <Color bold>{formatElapsedTime(startTime)}</Color>
      </Box>
    </Box>
  );
};

module.exports = Summary;
