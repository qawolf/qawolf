import { Box } from "grommet";

import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { border } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Add from "../../shared/icons/Add";
import Text from "../../shared/Text";

export default function Header(): JSX.Element {
  const handleCreateClick = (): void => {
    state.setModal({ name: "createTest" });
  };

  return (
    <Box
      align="center"
      background="gray0"
      border={{ ...border, side: "bottom" }}
      direction="row"
      flex={false}
      justify="between"
      pad="medium"
    >
      <Text color="gray9" size="componentHeader">
        {copy.getStarted}
      </Text>
      <Button
        IconComponent={Add}
        label={copy.createTest}
        onClick={handleCreateClick}
        type="primary"
      />
    </Box>
  );
}
