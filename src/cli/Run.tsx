import { Box, Color } from "ink";
import React from "react";
import { Steps } from "./Steps";
import { Run as RunType, Status } from "../types";

type PropTypes = {
  run: RunType;
  showSteps?: boolean;
};

const getBackgroundForStatus = (status: Status): object => {
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

export const Run = ({ run, showSteps }: PropTypes) => {
  const { name, status } = run;

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
      {!!showSteps && <Steps steps={run.steps} />}
    </Box>
  );
};
