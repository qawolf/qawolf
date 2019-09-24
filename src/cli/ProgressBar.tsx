import { Box, Color } from "ink";
import React from "react";

const LENGTH = 40; // characters

type PropTypes = {
  completeCount: number;
  totalCount: number;
};

export const ProgressBar = ({ completeCount, totalCount }: PropTypes) => {
  if (!totalCount) return null;

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
