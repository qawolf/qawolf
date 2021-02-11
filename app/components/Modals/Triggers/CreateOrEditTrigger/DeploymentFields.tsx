import { useState } from "react";

import DeployProviders, { Provider } from "./DeployProviders";

export default function DeploymentFields(): JSX.Element {
  const [provider, setProvider] = useState<Provider>("netlify");

  return (
    <>
      <DeployProviders provider={provider} setProvider={setProvider} />
    </>
  );
}
