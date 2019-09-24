import { Box, Color } from "ink";
import React from "react";
import { Status, Step } from "../types";

type PropTypes = { steps: Step[] };

const getColorForStatus = (status: Status): object => {
  if (status === "pass") {
    return { green: true };
  }
  if (status === "fail" || status === "unreached") {
    return { red: true };
  }

  return {};
};

const getEmojiForStatus = (status: Status): string => {
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

export const Steps = ({ steps }: PropTypes) => {
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
