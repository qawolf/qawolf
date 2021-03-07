import { Box } from "grommet";

import { TeamWithUsers } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Divider from "../../../shared-new/Divider";
import Text from "../../../shared-new/Text";
import Invite from "./Invite";
import Member from "./Member";

type Props = { team: TeamWithUsers };

const maxHeight = "320px";

export default function Members({ team }: Props): JSX.Element {
  const usersHtml = team.users.map((u) => {
    return (
      <Member
        avatarUrl={u.avatar_url}
        email={u.email}
        key={u.id}
        wolfColor={u.wolf_variant}
      />
    );
  });

  const invitesHtml = team.invites.map((i) => {
    return (
      <Member email={i.email} isPending key={i.id} wolfColor={i.wolf_variant} />
    );
  });

  return (
    <Box pad={{ vertical: "medium" }}>
      <Text color="gray9" margin={{ bottom: "medium" }} size="componentLarge">
        {copy.members}
      </Text>
      <Text color="gray9" margin={{ bottom: "xxsmall" }} size="componentBold">
        {copy.invite}
      </Text>
      <Invite users={team.users} />
      <Box
        margin={{ top: "medium" }}
        overflow={{ vertical: "auto" }}
        style={{ maxHeight }}
      >
        {usersHtml}
        {invitesHtml}
      </Box>
      <Divider />
    </Box>
  );
}
