import { Box } from "grommet";

import { useSendPostHogEvent } from "../../hooks/postHog";
import { copy } from "../../theme/copy";
import Text from "../shared-new/Text";

export default function NoMobile(): JSX.Element {
  useSendPostHogEvent("noMobile");

  return (
    <Box>
      <Text
        color="textDark"
        margin={{ top: "64px" }}
        size="large"
        textAlign="center"
        weight="medium"
      >
        {copy.noMobile}
      </Text>
    </Box>
  );
}
