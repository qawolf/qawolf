import { Box, Button, CheckBox } from "grommet";

import { UpdateTestTriggersVariables } from "../../../../../hooks/mutations";
import { SelectedTest, TestTriggers, Trigger } from "../../../../../lib/types";
import { hoverTransition } from "../../../../../theme/theme";
import Text from "../../../../shared/Text";
import styles from "./AssignTriggers.module.css";

type Props = {
  disabled: boolean;
  onClick: (variables: UpdateTestTriggersVariables) => void;
  selectedTests: SelectedTest[];
  testTriggers: TestTriggers;
  trigger: Trigger;
};

export default function AssignTrigger({
  disabled,
  onClick,
  selectedTests,
  testTriggers,
  trigger,
}: Props): JSX.Element {
  const triggerCallback = ({ id }: SelectedTest) => {
    if (!testTriggers[id]) return false;
    return testTriggers[id].includes(trigger.id);
  };

  const checked = selectedTests.every(triggerCallback);
  const indeterminate = !checked && selectedTests.some(triggerCallback);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent click from closing the dropdown
    // if box is checked, every test is in the trigger
    const remove_trigger_id = checked ? trigger.id : null;
    const add_trigger_id = checked ? null : trigger.id;

    onClick({
      add_trigger_id,
      remove_trigger_id,
      test_ids: selectedTests.map((test) => test.id),
    });
  };

  return (
    <Button
      a11yTitle={trigger.name}
      disabled={disabled}
      onClick={handleClick}
      plain
    >
      <Box
        align="center"
        className={styles.selectTrigger}
        direction="row"
        pad={{ horizontal: "medium", vertical: "small" }}
        style={{ transition: hoverTransition }}
      >
        <CheckBox checked={checked} indeterminate={indeterminate} />
        <Text color="black" margin={{ left: "small" }} size="medium">
          {trigger.name}
        </Text>
      </Box>
    </Button>
  );
}
