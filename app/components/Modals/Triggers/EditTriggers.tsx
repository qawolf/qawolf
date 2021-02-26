import { Box } from "grommet";

import { useUpdateTestTriggers } from "../../../hooks/mutations";
import { useOnHotKey } from "../../../hooks/onHotKey";
import { TestTriggers, Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Divider from "../../shared-new/Divider";
import Add from "../../shared-new/icons/Add";
import Buttons from "../../shared-new/Modal/Buttons";
import Header from "../../shared-new/Modal/Header";
import Text from "../../shared-new/Text";
import { buildUpdateTestTriggersResponse, getSelectState } from "./helpers";
import ListItem from "./ListItem";

type Props = {
  closeModal: () => void;
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (trigger: Trigger) => void;
  onEdit: (trigger: Trigger) => void;
  testIds: string[];
  testTriggers: TestTriggers[];
  triggers: Trigger[] | null;
};

export default function EditTriggers({
  closeModal,
  isLoading,
  onCreate,
  onDelete,
  onEdit,
  testIds,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  const [updateTestTriggers, { loading }] = useUpdateTestTriggers();

  useOnHotKey({ hotKey: "Enter", onHotKey: closeModal });

  const handleClick = (triggerId: string): void => {
    if (loading || !testIds.length) return;

    const state = getSelectState({ testIds, testTriggers, triggerId });
    const add_trigger_id = state === "all" ? null : triggerId;
    const remove_trigger_id = state === "all" ? triggerId : null;

    updateTestTriggers({
      optimisticResponse: {
        updateTestTriggers: buildUpdateTestTriggersResponse({
          addTriggerId: add_trigger_id,
          removeTriggerId: remove_trigger_id,
          testIds,
          testTriggers,
        }),
      },
      variables: { add_trigger_id, remove_trigger_id, test_ids: testIds },
    });
  };

  let innerHtml: JSX.Element;

  if (triggers?.length) {
    const triggersHtml = triggers.map((t) => {
      const state = getSelectState({
        testIds,
        testTriggers,
        triggerId: t.id,
      });

      return (
        <ListItem
          isDisabled={!testIds.length}
          key={t.id}
          onClick={() => handleClick(t.id)}
          onDelete={() => onDelete(t)}
          onEdit={() => onEdit(t)}
          selectState={state}
          trigger={t}
        />
      );
    });

    innerHtml = (
      <Box gap="xxxsmall" margin={{ vertical: "medium" }}>
        {triggersHtml}
      </Box>
    );
  } else {
    innerHtml = (
      <Text
        color="gray9"
        margin={{ vertical: "xxxlarge" }}
        size="componentParagraph"
        textAlign="center"
      >
        {isLoading ? copy.loading : copy.triggersEmpty}
      </Text>
    );
  }

  return (
    <Box flex={false}>
      <Header closeModal={closeModal} label={copy.editTriggers} />
      <Divider margin={{ top: "medium" }} />
      {innerHtml}
      <Buttons
        onPrimaryClick={closeModal}
        onSecondaryClick={onCreate}
        primaryLabel={copy.done}
        SecondaryIconComponent={Add}
        secondaryLabel={copy.createTrigger}
        showDivider
      />
    </Box>
  );
}
