import { Box } from "grommet";

import { routes } from "../../../../lib/routes";
import { copy } from "../../../../theme/copy";
import { border, overflowStyle } from "../../../../theme/theme";
import Avatar from "../../../shared/Avatar";
import Text from "../../../shared/Text";

type Props = {
  avatarUrl?: string | null;
  email: string;
  inviteId?: string;
  wolfColor: string;
};

export default function Member({
  avatarUrl,
  email,
  inviteId,
  wolfColor,
}: Props): JSX.Element {
  const inviteLink = inviteId
    ? `${window.location.origin}${routes.invite}/${inviteId}`
    : undefined;

  return (
    <Box
      align="center"
      border={{ ...border, side: "top" }}
      data-invite-email={inviteId ? email : undefined}
      data-invite-link={inviteLink}
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
      {!!inviteId && (
        <Text color="gray7" size="component">
          {copy.pending}
        </Text>
      )}
    </Box>
  );
}
