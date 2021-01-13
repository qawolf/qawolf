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
  const { code, group_id, state } = query as { [param: string]: string };

  const [createSlackIntegration, { called, error }] = useCreateSlackIntegration(
    {
      group_id: group_id || "",
      redirect_uri: `${routes.slack}/${group_id}`,
      slack_code: code || "",
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
    if (!called && code && group_id && state) {
      createSlackIntegration();
    }
  }, [called, code, createSlackIntegration, group_id, state]);

  return <Spinner />;
}
