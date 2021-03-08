import { Box } from "grommet";

import Text from "./Text";

type Props = { count: number };

const badgeHeight = "20px";

export default function CountBadge({ count }: Props): JSX.Element {
  return (
    <Box
      background="gray3"
      flex={false}
      height={badgeHeight}
      justify="center"
      pad={{ horizontal: "xxsmall" }}
      round="xlarge"
    >
      <Text color="gray9" size="componentSmall">
        {count}
      </Text>
    </Box>
  );
}
