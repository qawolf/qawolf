import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared-new/AppButton";
import Add from "../../../shared-new/icons/Add";

export default function Buttons(): JSX.Element {
  const handleCreateTestClick = (): void => {
    state.setModal({ name: "createTest" });
  };

  return (
    <Box align="center" direction="row">
      <Button
        IconComponent={Add}
        label={copy.createTest}
        onClick={handleCreateTestClick}
        type="primary"
      />
    </Box>
  );
}