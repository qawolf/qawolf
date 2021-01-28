import { useUpdateGroup } from "../../../../hooks/mutations";
import { state } from "../../../../lib/state";
import { Group } from "../../../../lib/types";
import Environments from "../../../shared-new/Environments";

type Props = { group: Group };

export default function SelectEnvironment({ group }: Props): JSX.Element {
  const [updateGroup] = useUpdateGroup();

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);

    updateGroup({
      optimisticResponse: {
        updateGroup: {
          ...group,
          environment_id: environmentId,
        },
      },
      variables: {
        environment_id: environmentId,
        id: group.id,
      },
    });
  };

  return (
    <Environments
      direction="down"
      onEnvironmentClick={handleEnvironmentClick}
      selectedEnvironmentId={group.environment_id}
    />
  );
}
