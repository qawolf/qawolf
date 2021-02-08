import { useEffect } from "react";

import { useUpdateTrigger } from "../../../../hooks/mutations";
import { state } from "../../../../lib/state";
import { Trigger } from "../../../../lib/types";
import Environments from "../../../shared-new/Environments";

type Props = { trigger: Trigger };

export default function SelectEnvironment({ trigger }: Props): JSX.Element {
  // update selected environment to current trigger's environment
  useEffect(() => {
    if (trigger.environment_id) state.setEnvironmentId(trigger.environment_id);
  }, [trigger.environment_id]);

  const [updateTrigger] = useUpdateTrigger();

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);

    updateTrigger({
      optimisticResponse: {
        updateTrigger: {
          ...trigger,
          environment_id: environmentId,
        },
      },
      variables: {
        environment_id: environmentId,
        id: trigger.id,
      },
    });
  };

  return (
    <Environments
      direction="down"
      onEnvironmentClick={handleEnvironmentClick}
      selectedEnvironmentId={trigger.environment_id}
    />
  );
}
