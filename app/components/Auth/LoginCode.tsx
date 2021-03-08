import { Box } from "grommet";
import { RiKey2Line } from "react-icons/ri";

import { AuthMode } from "../../lib/types";
import { copy } from "../../theme/copy";
import { colors, edgeSize } from "../../theme/theme-new";
import Text from "../shared/Text";

type Props = { mode: AuthMode };

export default function LoginCode({ mode }: Props): JSX.Element {
  return (
    <Box align="center" direction="row" justify="center">
      <RiKey2Line
        color={colors.textLight}
        size={edgeSize.medium}
        style={{ marginRight: edgeSize.xxsmall }}
      />
      <Text color="textLight" size="xsmall" textAlign="center" weight="normal">
        {copy.loginCode(mode)}
      </Text>
    </Box>
  );
}
