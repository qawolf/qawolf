import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useEnsureUser } from "../../hooks/ensureUser";
import { useUpdateUser } from "../../hooks/mutations";
import { useGroups } from "../../hooks/queries";
import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import { UserContext } from "../UserContext";
import Settings from "./Settings";
import Sidebar from "./Sidebar";
import Suite from "./Suite";
import Suites from "./Suites";
import Tests from "./Tests";

export default function Dashboard(): JSX.Element {
  useEnsureUser();

  const { asPath, pathname, query } = useRouter();
  const { teamId } = useContext(StateContext);
  const { user } = useContext(UserContext);

  const { data } = useGroups({ team_id: teamId });
  const groups = data?.groups || null;

  const [updateUser] = useUpdateUser();

  // show create test modal once if not onboarded
  useEffect(() => {
    if (!pathname.includes(routes.tests) || !user || user.onboarded_at) return;

    state.setModal({ name: "createTest" });
    updateUser({ variables: { onboarded_at: new Date().toISOString() } });
  }, [pathname, updateUser, user]);

  // update the current location in global state for use in editor back button
  useEffect(() => {
    state.setDashboardUri(asPath);
  }, [asPath]);

  let innerHtml = <Tests groups={groups} />;
  if (pathname.includes(routes.suites) && query.suite_id) {
    innerHtml = <Suite suiteId={query.suite_id as string} />;
  } else if (pathname.includes(routes.suites)) {
    innerHtml = <Suites />;
  } else if (pathname.includes(routes.settings)) {
    innerHtml = <Settings />;
  }

  return (
    <Box direction="row" height="100vh">
      <Sidebar groups={groups} />
      {innerHtml}
    </Box>
  );
}
