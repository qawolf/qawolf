import { Box, Color } from "ink";
import React from "react";
import { Summary } from "../types";

const WIDTH = 7;

type PropTypes = {
  startTime: string;
  summary: Summary | null;
};

const formatElapsedTime = (startTime: string) => {
  const elapsedSeconds =
    (new Date().getTime() - new Date(startTime).getTime()) / 1000;
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  return `${elapsedMinutes}m ${remainingSeconds.toFixed(2)}s`;
};

export const Results = ({ startTime, summary }: PropTypes) => {
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
