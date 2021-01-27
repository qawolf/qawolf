import { useContext } from "react";

import { useEnvironments } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Edit from "../../shared-new/icons/Edit";
import Select from "../../shared-new/Select";
import Action from "../../shared-new/Select/Action";
import Option from "../../shared-new/Select/Option";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";

export default function SelectEnvironment(): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);

  const { data } = useEnvironments({ team_id: teamId }, { environmentId });

  const environments = data?.environments || [];
  const selectedEnvironment = environments.find((e) => e.id === environmentId);

  const optionsHtml = environments.map((e) => {
    return (
      <Option
        isSelected={e.id === environmentId}
        key={e.id}
        label={e.name}
        onClick={() => state.setEnvironmentId(e.id)}
      />
    );
  });

  const openEnvironmentsModal = (): void =>
    state.setModal({ name: "environments" });

  return (
    <>
      <Text
        color="gray9"
        margin={{ bottom: "xxsmall", top: "large" }}
        size="componentBold"
      >
        {copy.environment}
      </Text>
      <Select label={selectedEnvironment?.name || copy.loading}>
        {optionsHtml}
        <Action
          IconComponent={Edit}
          dividerSide="top"
          label={copy.environmentsEdit}
          onClick={openEnvironmentsModal}
        />
      </Select>
    </>
  );
}
