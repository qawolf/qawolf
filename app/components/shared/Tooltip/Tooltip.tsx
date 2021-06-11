import { Box } from "grommet";

import { borderSize } from "../../../theme/theme";
import Text from "../Text";

type Props = { label: string };

export default function Tooltip({ label }: Props): JSX.Element {
  return (
    <Box
      background="gray9"
      pad={{ horizontal: "xxsmall", vertical: "xxxsmall" }}
      round={borderSize.small}
    >
      <Text color="gray0" size="componentSmall">
        {label}
      </Text>
    </Box>
  );
}
