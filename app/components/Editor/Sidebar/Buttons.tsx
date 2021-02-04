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
  onAction: () => void;
  run: Run;
  selection: Selection;
};

export default function Buttons({
  onAction,
  run,
  selection,
}: Props): JSX.Element {
  const { environmentId } = useContext(StateContext);

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: onAction });

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
        isDisabled={run ? !run.environment_id : false}
        onEnvironmentClick={handleEnvironmentClick}
        selectedEnvironmentId={run ? run.environment_id : environmentId}
        width={width}
      />
      <Button
        IconComponent={run ? Edit : Play}
        justify="center"
        label={run ? copy.editTest : runLabel}
        onClick={onAction}
        type="primary"
        width={width}
      />
    </Box>
  );
}
