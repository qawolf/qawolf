import { Box } from "grommet";
import { useContext } from "react";

import { useOnHotKey } from "../../../hooks/onHotKey";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import Environments from "../../shared-new/Environments";
import Play from "../../shared-new/icons/Play";
import { StateContext } from "../../StateContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";

const width = `calc(50% - (${edgeSize.xxsmall} / 2))`;

export default function Buttons(): JSX.Element {
  const { environmentId } = useContext(StateContext);
  const { controller, team, test } = useContext(TestContext);
  const { runTest, selection } = useContext(RunnerContext);

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
  };

  const handleRunClick = (): void => {
    if (!test) return;
    const { code, id: test_id, version } = controller;
    runTest({ code, helpers: team.helpers, selection, test_id, version });
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleRunClick });

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
        IconComponent={Play}
        justify="center"
        label={runLabel}
        onClick={handleRunClick}
        type="primary"
        width={width}
      />
    </Box>
  );
}
