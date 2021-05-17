import { Box } from "grommet";

import { edgeSize } from "../../../theme/theme";
import Logo from "../icons/Logo";
import Text from "../Text";

type Props = {
  label: string;
};

export default function Header({ label }: Props): JSX.Element {
  return (
    <Box align="center" margin={{ top: "xlarge" }}>
      <Logo width={edgeSize.xxxlarge} />
      <Text
        margin={{ bottom: "xxlarge", top: "medium" }}
        size="componentHeader"
      >
        {label}
      </Text>
    </Box>
  );
}
