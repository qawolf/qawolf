import { Box } from "grommet";
import { useContext } from "react";

import { useOnHotKey } from "../../../hooks/onHotKey";
import { state } from "../../../lib/state";
import { Run } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import Environments from "../../shared-new/Environments";
import Edit from "../../shared-new/icons/Edit";
import Play from "../../shared-new/icons/Play";
import { StateContext } from "../../StateContext";
import { Selection } from "../hooks/selection";

const width = `calc(50% - (${edgeSize.xxsmall} / 2))`;

type Props = {
  isRun: boolean;
  onRunClick: () => void;
  selection: Selection;
};

export default function Buttons({
  isRun,
  onRunClick,
  selection,
}: Props): JSX.Element {
  const { environmentId } = useContext(StateContext);

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: onRunClick });

  const runLabel = selection
    ? copy.runLines(selection.endLine - selection.startLine + 1)
    : copy.runTest;

  return (
    <Box
      border={{ color: "gray9", side: "top", size: borderSize.xsmall }}
      direction="row"
      flex={false}
      justify="between"
      pad="small"
    >
      <Environments
        onEnvironmentClick={handleEnvironmentClick}
        selectedEnvironmentId={environmentId}
        width={width}
      />
      <Button
        IconComponent={isRun ? Edit : Play}
        justify="center"
        label={isRun ? copy.editTest : runLabel}
        onClick={onRunClick}
        type="primary"
        width={width}
      />
    </Box>
  );
}
