import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import Spinner from "../components/shared/Spinner";
import { StateContext } from "../components/StateContext";
import { useEnsureUser } from "../hooks/ensureUser";
import { useCreateGitHubIntegrations } from "../hooks/mutations";
import { routes } from "../lib/routes";

export default function GitHubIntegration(): JSX.Element {
  useEnsureUser();

  const { dashboardUri, teamId } = useContext(StateContext);

  const { asPath, query, replace } = useRouter();
  const { installation_id } = query as { [param: string]: string };

  const [
    createGitHubIntegrations,
    { called, error },
  ] = useCreateGitHubIntegrations(
    {
      installation_id: Number(installation_id || ""),
      team_id: teamId,
    },
    { dashboardUri }
  );

  // should not be on this page if no installation id or teamId
  useEffect(() => {
    // need to check asPath because Next.js router does not hydrate query on first render
    // https://stackoverflow.com/a/61043260
    const hasInstallationId = asPath.includes("installation_id=");

    if (error || !hasInstallationId || !teamId) {
      replace(routes.tests);
    }
  }, [asPath, error, replace, teamId]);

  // create GitHub integration
  useEffect(() => {
    if (!called && installation_id && teamId) {
      createGitHubIntegrations();
    }
  }, [called, createGitHubIntegrations, installation_id, teamId]);

  return <Spinner />;
}
