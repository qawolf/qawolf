import capitalize from "lodash/capitalize";
import { ChangeEvent } from "react";

import { DeploymentEnvironment, NetlifyEvent } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import RadioButtonGroup from "../../../shared/RadioButtonGroup";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";
import NetlifyBuildPlugin from "./NetlifyBuildPlugin";

type Props = {
  deployEnv: DeploymentEnvironment | null;
  netlifyEvent: NetlifyEvent | null;
  setDeployEnv: (env: DeploymentEnvironment | null) => void;
  setNetlifyEvent: (netlifyEvent: NetlifyEvent) => void;
};

export const radioButtonProps = {
  direction: "row" as const,
  gap: edgeSize.medium,
};

const deployEnvOptions = ["all", "deploy-preview", "production"].map(
  (option) => {
    return {
      label: capitalize(option.split("-").join(" ")),
      value: option,
    };
  }
);

const netlifyEventOptions = [
  {
    label: "No (run tests onSuccess)",
    value: "onSuccess",
  },
  {
    label: "Yes (run tests onPostBuild)",
    value: "onPostBuild",
  },
];

export default function NetlifyFields({
  deployEnv,
  netlifyEvent,
  setDeployEnv,
  setNetlifyEvent,
}: Props): JSX.Element {
  const handleDeployEnvChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDeployEnv(e.target.value as DeploymentEnvironment);
  };

  const handleNetlifyEventChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNetlifyEvent(e.target.value as NetlifyEvent);
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
      <Text {...labelTextProps}>{copy.netlifyEvent}</Text>
      <RadioButtonGroup
        {...radioButtonProps}
        name="netlify-event"
        onChange={handleNetlifyEventChange}
        options={netlifyEventOptions}
        value={netlifyEvent}
      />
    </>
  );
}
