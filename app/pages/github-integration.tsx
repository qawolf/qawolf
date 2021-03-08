import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import Logo from "../components/shared/icons/Logo";
import Spinner from "../components/shared/Spinner";
import Text from "../components/shared/Text";
import { StateContext } from "../components/StateContext";
import { useEnsureUser } from "../hooks/ensureUser";
import { useCreateGitHubIntegrations } from "../hooks/mutations";
import { routes } from "../lib/routes";
import { copy } from "../theme/copy";
import { edgeSize } from "../theme/theme-new";

export default function GitHubIntegration(): JSX.Element {
  useEnsureUser();

  const { teamId } = useContext(StateContext);

  const { asPath, query, replace } = useRouter();
  const { installation_id } = query as { [param: string]: string };

  const [
    createGitHubIntegrations,
    { called, data, error },
  ] = useCreateGitHubIntegrations({
    installation_id: Number(installation_id || ""),
    team_id: teamId,
  });

  // should not be on this page if no installation id or teamId
  useEffect(() => {
    // need to check asPath because Next.js router does not hydrate query on first render
    // https://stackoverflow.com/a/61043260
    const hasInstallationId = asPath.includes("installation_id=");

    if (!hasInstallationId || !teamId) replace(routes.tests);
  }, [asPath, replace, teamId]);

  // create GitHub integration
  useEffect(() => {
    if (!called && installation_id && teamId) {
      createGitHubIntegrations();
    }
  }, [called, createGitHubIntegrations, installation_id, teamId]);

  // close window if mutation succeeds
  useEffect(() => {
    if (data?.createGitHubIntegrations) {
      window.close();
    }
  }, [data?.createGitHubIntegrations]);

  if (!data?.createGitHubIntegrations && !error) {
    return <Spinner margin={{ top: edgeSize.xxxlarge }} />;
  }

  return (
    <Box align="center" margin={{ top: "large" }}>
      <Logo width={edgeSize.xxxlarge} />
      <Text
        color={error ? "danger" : "gray9"}
        margin={{ top: "large" }}
        size="componentHeader"
      >
        {error
          ? `${copy.somethingWrong}: ${error.message}`
          : copy.gitHubComplete}
      </Text>
    </Box>
  );
}
