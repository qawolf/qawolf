import { Box } from "grommet";
import { useContext } from "react";

import { edgeSize } from "../../../theme/theme";
import { borderSize } from "../../../theme/theme";
import { RunnerContext } from "../contexts/RunnerContext";
import CodeToggle from "./CodeToggle";
import SelectButton from "./SelectButton";

export default function Header(): JSX.Element {
  const {
    elementChooserValue,
    isRunnerConnected,
    mouseLineNumber,
    progress,
    startElementChooser,
    stopElementChooser,
  } = useContext(RunnerContext);

  const isChooserActive = elementChooserValue.isActive;

  const isDisabled = !isRunnerConnected || progress?.status === "created";

  const onChooseToggle = () => {
    if (isChooserActive) {
      stopElementChooser();
    } else {
      startElementChooser();
    }
  };

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
      <CodeToggle
        isDisabled={isChooserActive || isDisabled}
        mouseLineNumber={mouseLineNumber}
      />
      <SelectButton
        isActive={isChooserActive}
        isDisabled={isDisabled}
        onClick={onChooseToggle}
      />
    </Box>
  );
}
