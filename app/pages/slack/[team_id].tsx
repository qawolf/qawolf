import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import Spinner from "../../components/shared/Spinner";
import { StateContext } from "../../components/StateContext";
import { useEnsureUser } from "../../hooks/ensureUser";
import { useCreateSlackIntegration } from "../../hooks/mutations";
import { routes } from "../../lib/routes";

export default function Slack(): JSX.Element {
  useEnsureUser();

  const { dashboardUri } = useContext(StateContext);

  const { asPath, query, replace } = useRouter();
  const { code, state, team_id } = query as { [param: string]: string };

  const [createSlackIntegration, { called, error }] = useCreateSlackIntegration(
    {
      redirect_uri: `${routes.slack}/${team_id}`,
      slack_code: code || "",
      team_id: team_id || "",
    },
    { dashboardUri }
  );

  // should not be on this page if no code or state
  useEffect(() => {
    // need to check asPath because Next.js router does not hydrate query on first render
    // https://stackoverflow.com/a/61043260
    const hasCode = asPath.includes("code=");
    const hasState = asPath.includes("state=");

    if (error || !hasCode || !hasState) {
      replace(routes.tests);
    }
  }, [asPath, error, replace]);

  // create Slack integration
  useEffect(() => {
    if (!called && code && state && team_id) {
      createSlackIntegration();
    }
  }, [called, code, createSlackIntegration, state, team_id]);

  return <Spinner />;
}
