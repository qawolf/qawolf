import { Box } from "grommet";
import { useRouter } from "next/router";

import { useCreateGroup, useUpdateGroup } from "../../../hooks/mutations";
import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { Group, MutableListArgs, MutableListFields } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize } from "../../../theme/theme-new";
import MutableList from "../../shared/MutableList";
import Text from "../../shared/Text";

type Props = {
  groups: Group[] | null;
  teamId: string;
};

export default function Groups({ groups, teamId }: Props): JSX.Element {
  const { query, replace } = useRouter();
  const groupId = (query.group_id as string) || null;

  const [createGroup, { loading: isCreateLoading }] = useCreateGroup();
  const [updateGroup, { loading: isEditLoading }] = useUpdateGroup();

  const handleSave = ({ callback, fields, name }: MutableListArgs): void => {
    if (isCreateLoading || isEditLoading) return;

    if (fields) {
      const group = groups?.find((g) => g.id === fields.id);

      updateGroup({
        optimisticResponse: group
          ? {
              updateGroup: {
                ...group,
                name,
              },
            }
          : undefined,
        variables: { id: fields.id, name },
      }).then(callback);
    } else {
      createGroup({ variables: { name, team_id: teamId } }).then(callback);
    }
  };

  const handleClick = (groupId: string): void => {
    replace(`${routes.tests}/${groupId}`);
  };

  const handleDelete = (group: MutableListFields): void => {
    state.setModal({ group, name: "deleteGroup" });
  };

  return (
    <Box margin={{ top: "medium" }}>
      <Box flex={false} margin={{ bottom: borderSize.small }} pad="xxsmall">
        <Text color="gray9" size="componentBold">
          {copy.groups}
        </Text>
      </Box>
      <MutableList
        fieldsList={groups}
        hideCreateButton={!teamId}
        onClick={handleClick}
        onDelete={handleDelete}
        onSave={handleSave}
        selectedId={groupId}
        type="group"
      />
    </Box>
  );
}
