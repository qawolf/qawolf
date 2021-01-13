import { Box } from "grommet";
import { Alert } from "grommet-icons";

import { colors, iconSize } from "../../theme/theme";
import Text from "../shared/Text";

type Props = { error?: string };

export default function CodeError({ error }: Props): JSX.Element {
  if (!error) return null;

  return (
    <Box
      align="center"
      background="lightRed"
      border={{ color: "red" }}
      direction="row"
      margin={{ top: "large" }}
      pad={{ horizontal: "medium", vertical: "small" }}
      round="small"
    >
      <Alert color={colors.black} size={iconSize} />
      <Text color="black" margin={{ left: "small" }} size="small">
        {error}
      </Text>
    </Box>
  );
}
