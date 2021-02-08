import { useUpdateTrigger } from "../../../../hooks/mutations";
import { Trigger } from "../../../../lib/types";
import EditableText from "../../../shared/EditableText";

type Props = { trigger: Trigger };

const MAX_WIDTH = "320px";

export default function TriggerName({ trigger }: Props): JSX.Element {
  const [updateTrigger] = useUpdateTrigger();

  const handleChange = (newName: string) => {
    updateTrigger({
      optimisticResponse: {
        updateTrigger: {
          ...trigger,
          name: newName,
        },
      },
      variables: { id: trigger.id, name: newName },
    });
  };

  return (
    <EditableText
      bold
      disabled={trigger.is_default}
      maxWidth={MAX_WIDTH}
      onChange={handleChange}
      value={trigger.name}
    />
  );
}
