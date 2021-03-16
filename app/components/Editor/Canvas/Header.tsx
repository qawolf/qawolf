import { Box } from "grommet";
import { useContext } from "react";

import { edgeSize } from "../../../theme/theme";
import { borderSize } from "../../../theme/theme";
import { RunnerContext } from "../contexts/RunnerContext";
import CodeToggle from "./CodeToggle";
import SelectButton from "./SelectButton";

export default function Header(): JSX.Element {
  const { isRunnerConnected, mouseLineNumber, progress } = useContext(
    RunnerContext
  );
  // TODO: comment back in
  // const isDisabled = !isRunnerConnected || progress?.status === "created";
  const isDisabled = false;
  // TODO: fill out
  const isActive = true;

  return (
    <Box
      align="center"
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      flex={false}
      height={`calc(20px + (2 * ${edgeSize.small}))`} // height of code toggle
      justify="between"
      pad="small"
    >
      <CodeToggle isDisabled={isDisabled} mouseLineNumber={mouseLineNumber} />
      <SelectButton isActive={isActive} isDisabled={isDisabled} />
    </Box>
  );
}
