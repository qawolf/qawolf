import { Box, Button, CheckBox } from "grommet";

import { UpdateGroupTestsVariables } from "../../../../../hooks/mutations";
import { Group, GroupTests, SelectedTest } from "../../../../../lib/types";
import { hoverTransition } from "../../../../../theme/theme";
import Text from "../../../../shared/Text";
import styles from "./AssignGroups.module.css";

type Props = {
  disabled: boolean;
  group: Group;
  groupTests: GroupTests;
  onClick: (variables: UpdateGroupTestsVariables) => void;
  selectedTests: SelectedTest[];
};

export default function AssignGroup({
  disabled,
  group,
  groupTests,
  onClick,
  selectedTests,
}: Props): JSX.Element {
  const groupCallback = ({ id }: SelectedTest) => {
    if (!groupTests[id]) return false;
    return groupTests[id].includes(group.id);
  };

  const checked = selectedTests.every(groupCallback);
  const indeterminate = !checked && selectedTests.some(groupCallback);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent click from closing the dropdown
    // if box is checked, every test is in the group
    const remove_group_id = checked ? group.id : null;
    const add_group_id = checked ? null : group.id;

    onClick({
      add_group_id,
      remove_group_id,
      test_ids: selectedTests.map((test) => test.id),
    });
  };

  return (
    <Button
      a11yTitle={group.name}
      disabled={disabled}
      onClick={handleClick}
      plain
    >
      <Box
        align="center"
        className={styles.selectGroup}
        direction="row"
        pad={{ horizontal: "medium", vertical: "small" }}
        style={{ transition: hoverTransition }}
      >
        <CheckBox checked={checked} indeterminate={indeterminate} />
        <Text color="black" margin={{ left: "small" }} size="medium">
          {group.name}
        </Text>
      </Box>
    </Button>
  );
}
