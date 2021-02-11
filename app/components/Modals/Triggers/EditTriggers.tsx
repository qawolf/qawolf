import { Box } from "grommet";

import { useUpdateTestTriggers } from "../../../hooks/mutations";
import { TestTriggers, Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Add from "../../shared-new/icons/Add";
import Buttons from "../../shared-new/Modal/Buttons";
import Header from "../../shared-new/Modal/Header";
import { getIsSelected } from "./helpers";
import ListItem from "./ListItem";

type Props = {
  closeModal: () => void;
  onCreate: () => void;
  onDelete: (trigger: Trigger) => void;
  onEdit: (trigger: Trigger) => void;
  testIds: string[];
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

export default function EditTriggers({
  closeModal,
  onCreate,
  onDelete,
  onEdit,
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
        onDelete={() => onDelete(t)}
        onEdit={() => onEdit(t)}
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
      <Buttons
        onPrimaryClick={closeModal}
        onSecondaryClick={onCreate}
        primaryLabel={copy.done}
        SecondaryIconComponent={Add}
        secondaryLabel={copy.createTrigger}
      />
    </>
  );
}
