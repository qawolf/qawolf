import {
  UpdateGroupTestsVariables,
  useUpdateGroupTests,
} from "../../../../../hooks/mutations";
import { Group, GroupTests, SelectedTest } from "../../../../../lib/types";
import Dropdown from "../../../../shared/Dropdown";
import AssignGroup from "./AssignGroup";

type Props = {
  groups: Group[];
  groupTests: GroupTests;
  selectedTests: SelectedTest[];
};

export default function GroupsDropdown({
  groups,
  groupTests,
  selectedTests,
}: Props): JSX.Element {
  const [updateGroupTests, { loading }] = useUpdateGroupTests();

  const handleClick = (variables: UpdateGroupTestsVariables) => {
    if (loading) return;
    updateGroupTests({ variables });
  };

  const groupsHtml = groups.map((group) => {
    if (group.is_default) return null; // do not show default group as an option

    return (
      <AssignGroup
        disabled={loading}
        group={group}
        groupTests={groupTests}
        key={group.id}
        onClick={handleClick}
        selectedTests={selectedTests}
      />
    );
  });

  return <Dropdown pad={{ vertical: "small" }}>{groupsHtml}</Dropdown>;
}
