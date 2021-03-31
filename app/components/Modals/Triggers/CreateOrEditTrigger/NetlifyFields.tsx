import capitalize from "lodash/capitalize";
import { ChangeEvent } from "react";

import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import RadioButtonGroup from "../../../shared/RadioButtonGroup";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";
import NetlifyBuildPlugin from "./NetlifyBuildPlugin";

type Props = {
  deployEnv: string | null;
  setDeployEnv: (env: string | null) => void;
};

export const radioButtonProps = {
  direction: "row" as const,
  gap: edgeSize.medium,
};

const deployEnvOptions = ["all", "preview", "production"].map((option) => {
  return {
    label: capitalize(option),
    value: option,
  };
});

export default function NetlifyFields({
  deployEnv,
  setDeployEnv,
}: Props): JSX.Element {
  const handleDeployEnvChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDeployEnv(e.target.value);
  };

  return (
    <>
      <NetlifyBuildPlugin />
      <Text {...labelTextProps}>{copy.netlifyDeployContext}</Text>
      <RadioButtonGroup
        {...radioButtonProps}
        name="deploy-environment"
        onChange={handleDeployEnvChange}
        options={deployEnvOptions}
        value={deployEnv}
      />
    </>
  );
}
