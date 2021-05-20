import { DeploymentProvider } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import DeployProviders from "./DeployProviders";
import GitHubRepo from "./GitHubRepo";
import NetlifyFields from "./NetlifyFields";
import RenderFields from "./RenderFields";
import VercelFields from "./VercelFields";

type Props = {
  deployBranches: string | null;
  deployEnv: string | null;
  deployIntegrationId: string | null;
  deployPreviewUrl: string | null;
  deployProvider: DeploymentProvider;
  hasDeployError: boolean;
  hasDeployPreviewUrlError: boolean;
  setDeployBranches: (branches: string | null) => void;
  setDeployEnv: (env: string | null) => void;
  setDeployIntegrationId: (integrationId: string | null) => void;
  setDeployPreviewUrl: (deployPreviewUrl: string | null) => void;
  setDeployProvider: (deployProvider: DeploymentProvider) => void;
};

export default function DeployFields({
  deployBranches,
  deployEnv,
  deployIntegrationId,
  deployPreviewUrl,
  deployProvider,
  hasDeployError,
  hasDeployPreviewUrlError,
  setDeployBranches,
  setDeployEnv,
  setDeployIntegrationId,
  setDeployPreviewUrl,
  setDeployProvider,
}: Props): JSX.Element {
  let innerHtml = (
    <>
      <GitHubRepo
        deployIntegrationId={deployIntegrationId}
        hasError={hasDeployError}
        setDeployIntegrationId={setDeployIntegrationId}
      />
      <RenderFields
        deployPreviewUrl={deployPreviewUrl}
        hasError={hasDeployPreviewUrlError}
        setDeployPreviewUrl={setDeployPreviewUrl}
      />
    </>
  );

  if (deployProvider === "vercel") {
    innerHtml = (
      <>
        <GitHubRepo
          deployIntegrationId={deployIntegrationId}
          hasError={hasDeployError}
          setDeployIntegrationId={setDeployIntegrationId}
        />
        <VercelFields
          deployBranches={deployBranches}
          deployEnv={deployEnv}
          setDeployBranches={setDeployBranches}
          setDeployEnv={setDeployEnv}
        />
      </>
    );
  }

  if (deployProvider === "netlify") {
    innerHtml = (
      <>
        <NetlifyFields deployEnv={deployEnv} setDeployEnv={setDeployEnv} />
        <GitHubRepo
          deployIntegrationId={deployIntegrationId}
          label={copy.netlifyGitHub}
          setDeployIntegrationId={setDeployIntegrationId}
        />
      </>
    );
  }

  return (
    <>
      <DeployProviders
        provider={deployProvider}
        setProvider={setDeployProvider}
      />
      {innerHtml}
    </>
  );
}
