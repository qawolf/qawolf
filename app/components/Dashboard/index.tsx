import { Box, ThemeContext } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useEnsureUser } from "../../hooks/ensureUser";
import { useUpdateUser } from "../../hooks/mutations";
import { state } from "../../lib/state";
import { theme } from "../../theme/theme-new";
import Spinner from "../shared/Spinner";
import { UserContext } from "../UserContext";
import Sidebar from "./Sidebar";
import Tests from "./Tests";

export default function Dashboard(): JSX.Element {
  useEnsureUser();

  const { asPath } = useRouter();
  const { user } = useContext(UserContext);

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

  if (!user) return <Spinner />;

  return (
    <ThemeContext.Extend value={theme}>
      <Box direction="row" height="100vh">
        <Sidebar />
        <Tests />
      </Box>
    </ThemeContext.Extend>
  );
}
