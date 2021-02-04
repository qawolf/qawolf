import { Box } from "grommet";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import Text from "../../../shared-new/Text";

const width = "240px";

export default function Environments(): JSX.Element {
  return (
    <Box flex={false} pad="medium" width={width}>
      <Box height={edgeSize.large} justify="center">
        <Text color="gray9" size="componentHeader">
          {copy.environments}
        </Text>
      </Box>
    </Box>
  );
}
