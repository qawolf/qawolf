import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext } from "react";

import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { Group, User, Wolf } from "../../../lib/types";
import { edgeSize } from "../../../theme/theme";
import { StateContext } from "../../StateContext";
import CreateGroup from "./CreateGroup";
import GroupLink from "./GroupLink";
import Plan from "./Plan";
import Team from "./Team";

type Props = {
  groupId?: string | null;
  groups: Group[];
  user: User;
  wolf: Wolf;
};

const TOP_PAD = `calc(${edgeSize.large} - ${edgeSize.small})`;
const WIDTH = "320px";

export default function Sidebar({
  groups,
  groupId,
  user,
  wolf,
}: Props): JSX.Element {
  const { query, replace } = useRouter();

  const { teamId } = useContext(StateContext);

  const selectedTeam = user.teams.find((team) => team.id === teamId) || null;

  const groupsHtml = groups.map((group) => {
    const handleClick = () => {
      // clear suite id if there is one
      if (query.suite_id) {
        replace(routes.tests);
      }

      state.setGroupId(group.id);
    };

    return (
      <GroupLink
        isSelected={group.id === groupId}
        group={group}
        key={group.id}
        onClick={handleClick}
      />
    );
  });

  return (
    <Box
      align="center"
      border={{ color: "borderGray", side: "right" }}
      fill="vertical"
      flex={false}
      justify="between"
      pad={{ horizontal: "large", top: TOP_PAD }}
      width={WIDTH}
    >
      <Box width="full">
        <Team selectedTeam={selectedTeam} user={user} />
        <Box margin={{ top: TOP_PAD }} overflow="auto">
          {groupsHtml}
          <CreateGroup teamId={teamId} />
        </Box>
      </Box>
      <Plan team={selectedTeam} wolf={wolf} />
    </Box>
  );
}
