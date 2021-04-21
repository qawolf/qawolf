import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useEnsureUser } from "../../hooks/ensureUser";
import { useGroups } from "../../hooks/queries";
import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import GetStarted from "./GetStarted";
import Settings from "./Settings";
import Sidebar from "./Sidebar";
import Suite from "./Suite";
import Suites from "./Suites";
import Tests from "./Tests";

export default function Dashboard(): JSX.Element {
  useEnsureUser();

  const { asPath, pathname, query } = useRouter();
  const { branch, teamId } = useContext(StateContext);

  const { data } = useGroups({ team_id: teamId });
  const groups = data?.groups || null;

  // update the current location in global state for use in editor back button
  useEffect(() => {
    state.setDashboardUri(asPath);
  }, [asPath]);

  let innerHtml = <Tests branch={branch} groups={groups} teamId={teamId} />;
  if (pathname.includes(routes.suites) && query.suite_id) {
    innerHtml = <Suite suiteId={query.suite_id as string} teamId={teamId} />;
  } else if (pathname.includes(routes.suites)) {
    innerHtml = <Suites teamId={teamId} />;
  } else if (pathname.includes(routes.getStarted)) {
    innerHtml = <GetStarted teamId={teamId} />;
  } else if (pathname.includes(routes.settings)) {
    innerHtml = <Settings />;
  }

  return (
    <Box data-hj-suppress height="100vh">
      <Box direction="row" fill>
        <Sidebar groups={groups} />
        {innerHtml}
      </Box>
    </Box>
  );
}
