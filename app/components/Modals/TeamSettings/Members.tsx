import { Box } from "grommet";

import { Invite as InviteType, User } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import Invite from "./Invite";
import Member from "./Member";

type Props = {
  invites: InviteType[];
  users: User[];
};

const MAX_HEIGHT = "320px";

export default function Members({ invites, users }: Props): JSX.Element {
  const membersHtml = users.map((user) => {
    return (
      <Member
        avatarUrl={user.avatar_url}
        email={user.email}
        key={user.id}
        wolfName={user.wolf_name}
        wolfVariant={user.wolf_variant}
      />
    );
  });

  const invitesHtml = invites.map((invite) => {
    return (
      <Member
        email={invite.email}
        inviteId={invite.id}
        isPending
        key={invite.id}
        wolfName={invite.wolf_name}
        wolfVariant={invite.wolf_variant}
      />
    );
  });

  return (
    <Box margin={{ top: "large" }}>
      <Text margin={{ bottom: "medium" }} color="gray" size="medium">
        {copy.members}
      </Text>
      <Box overflow="auto" style={{ maxHeight: MAX_HEIGHT }}>
        {membersHtml}
        {invitesHtml}
      </Box>
      <Invite users={users} />
    </Box>
  );
}
