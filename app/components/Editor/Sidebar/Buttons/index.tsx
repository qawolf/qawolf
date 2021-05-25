import { Box } from "grommet";
import { useContext } from "react";

import { useOnHotKey } from "../../../../hooks/onHotKey";
import { state } from "../../../../lib/state";
import { Selection } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { borderSize, edgeSize } from "../../../../theme/theme";
import Button from "../../../shared/AppButton";
import Environments from "../../../shared/Environments";
import Stop from "../../../shared/icons/Stop";
import { StateContext } from "../../../StateContext";
import RunButton from "./RunButton";

const width = `calc(50% - (${edgeSize.xxsmall} / 2))`;

type Props = {
  canStop: boolean;
  isActionDisabled: boolean;
  isRun: boolean;
  isRunLoading: boolean;
  onAction: () => void;
  selection: Selection;
};

export default function Buttons({
  canStop,
  isActionDisabled,
  isRun,
  isRunLoading,
  onAction,
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

  return (
    <Box
      border={{ color: "gray9", side: "top", size: borderSize.xsmall }}
      direction="row"
      flex={false}
      justify="between"
      pad="small"
    >
      {!isRun && (
        <Environments
          onEnvironmentClick={handleEnvironmentClick}
          selectedEnvironmentId={environmentId}
          width={width}
        />
      )}
      {canStop ? (
        <Button
          IconComponent={Stop}
          justify="center"
          label={copy.stopRunning}
          onClick={onAction}
          type="tertiary"
          width={width}
        />
      ) : (
        <RunButton
          isDisabled={isActionDisabled}
          isRun={isRun}
          isRunLoading={isRunLoading}
          onAction={onAction}
          selection={selection}
          width={width}
        />
      )}
    </Box>
  );
}
