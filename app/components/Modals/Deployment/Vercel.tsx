import { RadioButtonGroup } from "grommet";

import { DeploymentEnvironment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import BranchesInput from "./BranchesInput";

export const allBranches = "allBranches";
const selectedBranches = "selectedBranches";

type Props = {
  branches: string;
  environment: DeploymentEnvironment | null;
  hasError: boolean;
  isAllBranches: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setBranches: (branches: string) => void;
  setEnvironment: (environment: DeploymentEnvironment | null) => void;
};

const textProps = {
  color: "black",
  margin: { bottom: "medium" },
  size: "medium",
};

export default function Vercel({
  branches,
  environment,
  hasError,
  isAllBranches,
  onChange,
  setBranches,
  setEnvironment,
}: Props): JSX.Element {
  const handleEnvironmentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setEnvironment(e.target.value as DeploymentEnvironment);
  };

  return (
    <>
      <Text {...textProps}>{copy.deploymentsDetail}</Text>
      <RadioButtonGroup
        direction="row"
        gap="large"
        margin={{ bottom: "large" }}
        name="environment"
        onChange={handleEnvironmentChange}
        options={[
          { label: copy.all, value: "all" },
          { label: copy.preview, value: "preview" },
          { label: copy.production, value: "production" },
        ]}
        value={environment}
      />
      <Text {...textProps}>{copy.branchesDetail}</Text>
      <RadioButtonGroup
        direction="row"
        gap="large"
        name="branches"
        onChange={onChange}
        options={[
          { label: copy.allBranches, value: allBranches },
          { label: copy.selectedBranches, value: selectedBranches },
        ]}
        value={isAllBranches ? allBranches : selectedBranches}
      />
      <BranchesInput
        branches={branches}
        hasError={hasError}
        isAllBranches={isAllBranches}
        setBranches={setBranches}
      />
    </>
  );
}
