import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useEnsureUser } from "../../hooks/ensureUser";
import { useGroups, useSuite } from "../../hooks/queries";
import { state } from "../../lib/state";
import Spinner from "../shared/Spinner";
import { StateContext } from "../StateContext";
import { UserContext } from "../UserContext";
import Sidebar from "./Sidebar";
import Tests from "./Tests";

export default function Dashboard(): JSX.Element {
  useEnsureUser();

  const { user, wolf } = useContext(UserContext);

  const { asPath, query } = useRouter();
  const suiteId = (query.suite_id as string) || null;

  const { groupId, teamId } = useContext(StateContext);

  // this query sets selected group and team ids as needed
  useSuite({ id: suiteId || null }, { groupId, teamId });

  const { data } = useGroups(
    { team_id: teamId },
    { groupId, skipOnCompleted: !!suiteId }
  );

  // update the current location in global state for use in editor back button
  useEffect(() => {
    state.setDashboardUri(asPath);
  }, [asPath]);

  const groups = data?.groups;
  const selectedGroup = groups?.find((group) => group.id === groupId);

  if (!groups || !user || !wolf) {
    return <Spinner />;
  }

  return (
    <Box direction="row" height="100vh">
      <Sidebar groupId={groupId} groups={groups} wolf={wolf} user={user} />
      <Box background="lightBlue" fill="horizontal" pad="large">
        {!!selectedGroup && (
          <Tests
            groups={groups}
            selectedGroup={selectedGroup}
            wolfVariant={wolf.variant}
          />
        )}
      </Box>
    </Box>
  );
}
