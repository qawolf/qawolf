import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import { border, overflowStyle } from "../../../../theme/theme-new";
import Avatar from "../../../shared-new/Avatar";
import Text from "../../../shared-new/Text";

type Props = {
  avatarUrl?: string | null;
  email: string;
  isPending?: boolean;
  wolfColor: string;
};

export default function Member({
  avatarUrl,
  email,
  isPending,
  wolfColor,
}: Props): JSX.Element {
  return (
    <Box
      align="center"
      border={{ ...border, side: "top" }}
      direction="row"
      flex={false}
      justify="between"
      pad={{ vertical: "xsmall" }}
    >
      <Box align="center" direction="row">
        <Avatar avatarUrl={avatarUrl} wolfColor={wolfColor} />
        <Text
          color="gray9"
          margin={{ left: "xxsmall" }}
          size="component"
          style={overflowStyle}
        >
          {email}
        </Text>
      </Box>
      {!!isPending && (
        <Text color="gray7" size="component">
          {copy.pending}
        </Text>
      )}
    </Box>
  );
}
