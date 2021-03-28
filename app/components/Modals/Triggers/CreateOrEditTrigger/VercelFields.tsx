import capitalize from "lodash/capitalize";
import { ChangeEvent } from "react";

import { DeploymentEnvironment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import RadioButtonGroup from "../../../shared/RadioButtonGroup";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";
import DeployBranches from "./DeployBranches";
import { radioButtonProps } from "./NetlifyFields";

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
  const handleDeployEnvChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDeployEnv(e.target.value as DeploymentEnvironment);
  };

  return (
    <>
      <Text {...labelTextProps}>{copy.vercelDeploymentType}</Text>
      <RadioButtonGroup
        {...radioButtonProps}
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
