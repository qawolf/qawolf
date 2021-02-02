import { Box } from "grommet";
import { useContext } from "react";
import { state } from "../../../lib/state";
import { borderSize } from "../../../theme/theme-new";
import Environments, { width } from "../../shared-new/Environments";
import { StateContext } from "../../StateContext";
import Button from "../../shared-new/AppButton";
import Play from "../../shared-new/icons/Play";
import { copy } from "../../../theme/copy";

export default function Buttons(): JSX.Element {
  const { environmentId } = useContext(StateContext);

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
  };

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
      />
      <Button
        IconComponent={Play}
        justify="center"
        label={copy.runTest}
        onClick={() => null}
        type="primary"
        width={width}
      />
    </Box>
  );
}
