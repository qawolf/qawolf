import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useEnsureUser } from "../../hooks/ensureUser";
import { useUpdateUser } from "../../hooks/mutations";
import { useSuite, useTriggers } from "../../hooks/queries";
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

  const { teamId, triggerId } = useContext(StateContext);

  // this query sets selected team and trigger ids as needed
  useSuite({ id: suiteId || null }, { teamId, triggerId });

  const { data } = useTriggers(
    { team_id: teamId },
    { skipOnCompleted: !!suiteId, triggerId }
  );

  const [updateUser] = useUpdateUser();

  // show create test modal once if not onboarded
  useEffect(() => {
    if (!user || user.onboarded_at) return;

    state.setModal({ name: "createTest" });
    updateUser({ variables: { onboarded_at: new Date().toISOString() } });
  }, [updateUser, user]);

  // update the current location in global state for use in editor back button
  useEffect(() => {
    state.setDashboardUri(asPath);
  }, [asPath]);

  const triggers = data?.triggers;
  const selectedTrigger = triggers?.find((t) => t.id === triggerId);

  useEffect(() => {
    if (selectedTrigger) state.setEnvironmentId(selectedTrigger.environment_id);
  }, [selectedTrigger]);

  if (!triggers || !user || !wolf) {
    return <Spinner />;
  }

  return (
    <Box direction="row" height="100vh">
      <Sidebar
        triggerId={triggerId}
        triggers={triggers}
        user={user}
        wolf={wolf}
      />
      <Box background="lightBlue" fill="horizontal" pad="large">
        {!!selectedTrigger && (
          <Tests
            selectedTrigger={selectedTrigger}
            triggers={triggers}
            wolfVariant={wolf.variant}
          />
        )}
      </Box>
    </Box>
  );
}
