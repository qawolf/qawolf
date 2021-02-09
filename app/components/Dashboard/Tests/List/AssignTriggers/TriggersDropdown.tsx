import {
  UpdateTestTriggersVariables,
  useUpdateTestTriggers,
} from "../../../../../hooks/mutations";
import { SelectedTest, TestTriggers, Trigger } from "../../../../../lib/types";
import Dropdown from "../../../../shared/Dropdown";
import AssignTrigger from "./AssignTrigger";

type Props = {
  selectedTests: SelectedTest[];
  testTriggers: TestTriggers;
  triggers: Trigger[];
};

export default function TriggersDropdown({
  selectedTests,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  const [updateTestTriggers, { loading }] = useUpdateTestTriggers();

  const handleClick = (variables: UpdateTestTriggersVariables) => {
    if (loading) return;
    updateTestTriggers({ variables });
  };

  const triggersHtml = triggers.map((trigger) => {
    if (trigger.is_default) return null; // do not show default trigger as an option

    return (
      <AssignTrigger
        disabled={loading}
        key={trigger.id}
        onClick={handleClick}
        selectedTests={selectedTests}
        testTriggers={testTriggers}
        trigger={trigger}
      />
    );
  });

  return <Dropdown pad={{ vertical: "small" }}>{triggersHtml}</Dropdown>;
}
