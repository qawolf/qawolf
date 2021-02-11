import { useEffect, useState } from "react";
import { DeploymentEnvironment } from "../../../../lib/types";

import DeployProviders, { Provider } from "./DeployProviders";

type Props = {
  deployBranches: string | null;
  deployEnv: DeploymentEnvironment | null;
  deployIntegrationId: string | null;
  setDeployBranches: (branches: string | null) => void;
  setDeployEnv: (env: DeploymentEnvironment | null) => void;
  setDeployIntegrationId: (integrationId: string | null) => void;
};

export default function DeploymentFields({
  setDeployBranches,
  setDeployEnv,
}: Props): JSX.Element {
  const [provider, setProvider] = useState<Provider>("vercel");

  // clear extra settings if switching to netlify
  useEffect(() => {
    if (provider === "netlify") {
      setDeployBranches(null);
      setDeployEnv(null);
    }
  }, [provider]);

  return (
    <>
      <DeployProviders provider={provider} setProvider={setProvider} />
    </>
  );
}
