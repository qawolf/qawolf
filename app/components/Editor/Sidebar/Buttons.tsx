import { Box } from "grommet";
import { useContext } from "react";

import { useOnHotKey } from "../../../hooks/onHotKey";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import Environments from "../../shared-new/Environments";
import Edit from "../../shared-new/icons/Edit";
import Play from "../../shared-new/icons/Play";
import Stop from "../../shared-new/icons/Stop";
import { StateContext } from "../../StateContext";
import { Selection } from "../hooks/selection";

const width = `calc(50% - (${edgeSize.xxsmall} / 2))`;

type Props = {
  isActionDisabled: boolean;
  isRun: boolean;
  isRunning: boolean;
  onAction: () => void;
  runEnvironmentId: string;
  selection: Selection;
};

export default function Buttons({
  isActionDisabled,
  isRun,
  isRunning,
  onAction,
  runEnvironmentId,
  selection,
}: Props): JSX.Element {
  const { environmentId } = useContext(StateContext);

  const handleAutosave = (e: KeyboardEvent): void => {
    e.preventDefault();
    state.setToast({ expiresIn: 3000, message: copy.toastAutosave });
  };

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: onAction, requireMeta: true });

  useOnHotKey({ hotKey: "s", onHotKey: handleAutosave, requireMeta: true });

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
        isDisabled={isRun}
        onEnvironmentClick={handleEnvironmentClick}
        selectedEnvironmentId={isRun ? runEnvironmentId : environmentId}
        width={width}
      />
      {isRunning ? (
        <Button
          IconComponent={Stop}
          justify="center"
          label={copy.stopRunning}
          onClick={onAction}
          type="tertiary"
          width={width}
        />
      ) : (
        <Button
          IconComponent={isRun ? Edit : Play}
          isDisabled={isActionDisabled}
          justify="center"
          label={isRun ? copy.editTest : runLabel}
          onClick={onAction}
          type="primary"
          width={width}
        />
      )}
    </Box>
  );
}
