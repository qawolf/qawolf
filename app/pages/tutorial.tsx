import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import Spinner from "../components/shared/Spinner";
import { StateContext } from "../components/StateContext";
import { UserContext } from "../components/UserContext";
import { useCreateTestFromGuide } from "../hooks/createTestFromGuide";
import { useEnsureUser } from "../hooks/ensureUser";
import { routes } from "../lib/routes";
import { state } from "../lib/state";
import { edgeSize } from "../theme/theme";

export default function Tutorial(): JSX.Element {
  const { replace } = useRouter();
  useEnsureUser();

  const { teamId } = useContext(StateContext);
  const { user } = useContext(UserContext);

  const {
    called,
    error,
    onClick: createTestFromGuide,
  } = useCreateTestFromGuide({
    guide: "Create a Test",
    href: "/create-a-test",
    teamId,
    userId: user?.id,
  });

  useEffect(() => {
    if (called || !teamId || !user) return;
    createTestFromGuide();
  }, [called, createTestFromGuide, teamId, user]);

  // redirect if error
  useEffect(() => {
    if (error) {
      state.setToast({ error: true, message: error.message });
      replace(routes.tests);
    }
  }, [error, replace]);

  return <Spinner margin={{ top: edgeSize.xxxlarge }} />;
}
