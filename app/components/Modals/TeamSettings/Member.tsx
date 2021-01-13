import { Box } from "grommet";
import { useState } from "react";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import Avatar from "../../shared/Avatar";
import Text from "../../shared/Text";

type Props = {
  avatarUrl?: string | null;
  email: string;
  inviteId?: string;
  isPending?: boolean;
  wolfName: string;
  wolfVariant: string;
};

export default function Member({
  avatarUrl,
  email,
  inviteId,
  isPending,
  wolfName,
  wolfVariant,
}: Props): JSX.Element {
  const [showWolf, setShowWolf] = useState(false);

  const finalAvatarUrl = showWolf ? null : avatarUrl;
  const message = showWolf ? wolfName : email;

  const inviteLink = inviteId
    ? `${window.location.origin}${routes.invite}/${inviteId}`
    : undefined;

  return (
    <Box
      align="center"
      data-invite-email={inviteId ? email : undefined}
      data-invite-link={inviteLink}
      direction="row"
      flex={false}
      justify="between"
      margin={{ bottom: "medium" }}
      onMouseEnter={() => setShowWolf(true)}
      onMouseLeave={() => setShowWolf(false)}
    >
      <Box align="center" direction="row">
        <Avatar avatarUrl={finalAvatarUrl} wolfVariant={wolfVariant} />
        <Text color="black" margin={{ left: "small" }} size="medium">
          {message}
        </Text>
      </Box>
      {isPending && (
        <Text color="gray" size="small">
          {copy.pending}
        </Text>
      )}
    </Box>
  );
}
