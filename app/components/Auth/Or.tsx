import { Box, BoxProps } from "grommet";

import { copy } from "../../theme/copy";
import Text from "../shared-new/Text";

const dividerProps: BoxProps = {
  background: "fill20",
  height: "2px",
  width: "full",
};

export default function Or(): JSX.Element {
  return (
    <Box align="center" direction="row" margin={{ vertical: "xlarge" }}>
      <Box {...dividerProps} />
      <Text
        color="textLight"
        margin={{ horizontal: "small" }}
        size="xsmall"
        weight="normal"
      >
        {copy.or}
      </Text>
      <Box {...dividerProps} />
    </Box>
  );
}
