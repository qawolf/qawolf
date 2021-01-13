import { useUpdateGroup } from "../../../../hooks/mutations";
import { Group } from "../../../../lib/types";
import EditableText from "../../../shared/EditableText";

type Props = { group: Group };

const MAX_WIDTH = "320px";

export default function GroupName({ group }: Props): JSX.Element {
  const [updateGroup] = useUpdateGroup();

  const handleChange = (newName: string) => {
    updateGroup({
      optimisticResponse: {
        updateGroup: {
          ...group,
          name: newName,
        },
      },
      variables: { id: group.id, name: newName },
    });
  };

  return (
    <EditableText
      bold
      disabled={group.is_default}
      maxWidth={MAX_WIDTH}
      onChange={handleChange}
      value={group.name}
    />
  );
}
