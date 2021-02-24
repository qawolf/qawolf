import { Box, ThemeContext } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useEnsureUser } from "../../hooks/ensureUser";
import { useUpdateUser } from "../../hooks/mutations";
import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { theme } from "../../theme/theme-new";
import { UserContext } from "../UserContext";
import Sidebar from "./Sidebar";
import Suite from "./Suite";
import Tests from "./Tests";

export default function Dashboard(): JSX.Element {
  useEnsureUser();

  const { asPath, pathname, query } = useRouter();
  const { user } = useContext(UserContext);

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

  return (
    <ThemeContext.Extend value={theme}>
      <Box direction="row" height="100vh">
        <Sidebar />
        {pathname.includes(routes.suites) ? (
          <Suite suiteId={query.suite_id as string} />
        ) : (
          <Tests />
        )}
      </Box>
    </ThemeContext.Extend>
  );
}
