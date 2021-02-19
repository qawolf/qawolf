import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { copy } from "../../../../theme/copy";
import { borderSize, edgeSize } from "../../../../theme/theme-new";
import Button from "../../../shared-new/AppButton";
import Divider from "../../../shared-new/Divider";
import Add from "../../../shared-new/icons/Add";
import Configure from "../../../shared-new/icons/Configure";
import Lightning from "../../../shared-new/icons/Lightning";

export default function Buttons(): JSX.Element {
  const handleCreateTestClick = (): void => {
    state.setModal({ name: "createTest" });
  };

  const handleEnvironmentsClick = (): void => {
    state.setModal({ name: "environments" });
  };

  // TODO: set test ids
  const handleTriggersClick = (): void => {
    state.setModal({ name: "triggers", testIds: [] });
  };

  return (
    <Box align="center" direction="row">
      <Button
        IconComponent={Configure}
        label={copy.environments}
        margin={{ right: "small" }}
        onClick={handleEnvironmentsClick}
        type="secondary"
      />
      <Button
        IconComponent={Lightning}
        label={copy.triggers}
        onClick={handleTriggersClick}
        type="secondary"
      />
      <Divider
        height={edgeSize.large}
        margin={{ horizontal: "small" }}
        width={borderSize.xsmall}
      />
      <Button
        IconComponent={Add}
        label={copy.createTest}
        onClick={handleCreateTestClick}
        type="primary"
      />
    </Box>
  );
}
