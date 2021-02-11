import { TestTriggers, Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import ListItem from "./ListItem";

import Header from "../../shared-new/Modal/Header";
import { Box } from "grommet";
import { useUpdateTestTriggers } from "../../../hooks/mutations";
import { getIsSelected } from "./helpers";

type Props = {
  closeModal: () => void;
  testIds: string[];
  testTriggers: TestTriggers;
  triggers: Trigger[];
};

export default function EditTriggers({
  closeModal,
  testIds,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  const [updateTestTriggers, { loading }] = useUpdateTestTriggers();

  const handleClick = (triggerId: string): void => {
    if (loading) return;

    const isSelected = getIsSelected({ testIds, testTriggers, triggerId });

    updateTestTriggers({
      variables: {
        add_trigger_id: isSelected ? null : triggerId,
        remove_trigger_id: isSelected ? triggerId : null,
        test_ids: testIds,
      },
    });
  };

  const triggersHtml = triggers.map((t) => {
    const isSelected = getIsSelected({
      testIds,
      testTriggers,
      triggerId: t.id,
    });

    return (
      <ListItem
        isSelected={isSelected}
        key={t.id}
        onClick={() => handleClick(t.id)}
        trigger={t}
      />
    );
  });

  return (
    <>
      <Header closeModal={closeModal} label={copy.editTriggers} />
      <Box gap="xxxsmall" margin={{ top: "medium" }}>
        {triggersHtml}
      </Box>
    </>
  );
}
