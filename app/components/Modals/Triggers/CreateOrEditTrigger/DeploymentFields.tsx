import { useEffect, useState } from "react";

import { DeploymentEnvironment } from "../../../../lib/types";
import DeployProviders, { Provider } from "./DeployProviders";
import GitHubRepo from "./GitHubRepo";
import VercelFields from "./VercelFields";

type Props = {
  deployBranches: string | null;
  deployEnv: DeploymentEnvironment | null;
  deployIntegrationId: string | null;
  hasDeployError: boolean;
  setDeployBranches: (branches: string | null) => void;
  setDeployEnv: (env: DeploymentEnvironment | null) => void;
  setDeployIntegrationId: (integrationId: string | null) => void;
};

export default function DeploymentFields({
  deployBranches,
  deployEnv,
  deployIntegrationId,
  hasDeployError,
  setDeployBranches,
  setDeployEnv,
  setDeployIntegrationId,
}: Props): JSX.Element {
  const [provider, setProvider] = useState<Provider>("vercel");

  // clear Vercel settings if switching to Netlify
  useEffect(() => {
    if (provider !== "netlify") return;

    setDeployBranches(null);
    setDeployEnv(null);
  }, [provider, setDeployBranches, setDeployEnv]);

  return (
    <>
      <DeployProviders provider={provider} setProvider={setProvider} />
      <GitHubRepo
        deployIntegrationId={deployIntegrationId}
        hasDeployError={hasDeployError}
        setDeployIntegrationId={setDeployIntegrationId}
      />
      {provider === "vercel" && (
        <VercelFields
          deployBranches={deployBranches}
          deployEnv={deployEnv}
          setDeployBranches={setDeployBranches}
          setDeployEnv={setDeployEnv}
        />
      )}
    </>
  );
}
