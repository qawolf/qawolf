"use strict";
const { Box, Color } = require("ink");
const React = require("react");

const getColorForStatus = status => {
  if (status === "pass") {
    return { green: true };
  }
  if (status === "fail" || status === "unreached") {
    return { red: true };
  }

  return {};
};

const getEmojiForStatus = status => {
  if (status === "pass") {
    return "✓  ";
  }
  if (status === "fail" || status === "unreached") {
    return "✕  ";
  }
  if (status === "queued") {
    return "   ";
  }

  return "🐺 ";
};

const Steps = ({ steps }) => {
  const stepsHtml = steps.map((step, i) => {
    const { name, status } = step;

    return (
      <Box key={i}>
        <Color {...getColorForStatus(status)}>
          {getEmojiForStatus(status)}
        </Color>
        <Color dim={status === "queued"} strikethrough={status === "unreached"}>
          {name}
        </Color>
      </Box>
    );
  });

  return (
    <Box flexDirection="column" marginLeft={7}>
      {stepsHtml}
    </Box>
  );
};

module.exports = Steps;
