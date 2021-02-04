import { Box, ThemeContext } from "grommet";

import { useSendPostHogEvent } from "../../hooks/postHog";
import { copy } from "../../theme/copy";
import { theme } from "../../theme/theme-new";
import Text from "../shared-new/Text";

export default function NoMobile(): JSX.Element {
  useSendPostHogEvent("noMobile");

  return (
    <ThemeContext.Extend value={theme}>
      <Box>
        <Text
          color="gray9"
          margin={{ top: "64px" }}
          size="componentHeader"
          textAlign="center"
        >
          {copy.noMobile}
        </Text>
      </Box>
    </ThemeContext.Extend>
  );
}
