import capitalize from "lodash/capitalize";
import { ChangeEvent, useEffect } from "react";

import { DeploymentEnvironment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import RadioButtonGroup from "../../../shared-new/RadioButtonGroup";
import Text from "../../../shared-new/Text";
import { labelTextProps } from "../helpers";
import DeployBranches from "./DeployBranches";

type Props = {
  deployBranches: string | null;
  deployEnv: DeploymentEnvironment | null;
  setDeployBranches: (branches: string | null) => void;
  setDeployEnv: (env: DeploymentEnvironment | null) => void;
};

const deployEnvOptions = ["all", "preview", "production"].map((option) => {
  return {
    label: capitalize(option),
    value: option,
  };
});

export default function VercelFields({
  deployBranches,
  deployEnv,
  setDeployBranches,
  setDeployEnv,
}: Props): JSX.Element {
  // use default deploy environment if none specified
  useEffect(() => {
    if (!deployEnv) setDeployEnv("all");
  }, [deployEnv, setDeployEnv]);

  const handleDeployEnvChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDeployEnv(e.target.value as DeploymentEnvironment);
  };

  return (
    <>
      <Text {...labelTextProps}>{copy.vercelDeploymentType}</Text>
      <RadioButtonGroup
        direction="row"
        gap="medium"
        name="deploy-environment"
        onChange={handleDeployEnvChange}
        options={deployEnvOptions}
        value={deployEnv}
      />
      <DeployBranches
        deployBranches={deployBranches}
        setDeployBranches={setDeployBranches}
      />
    </>
  );
}
