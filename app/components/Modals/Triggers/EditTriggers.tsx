import { Box } from "grommet";
import { ReactNode } from "react";

import { useUpdateTestTriggers } from "../../../hooks/mutations";
import { useOnHotKey } from "../../../hooks/onHotKey";
import { TestTriggers, Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Divider from "../../shared/Divider";
import Add from "../../shared/icons/Add";
import Buttons from "../../shared/Modal/Buttons";
import Text from "../../shared/Text";
import Header from "./Header";
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

  let innerHtml: ReactNode;

  if (!isLoading && triggers?.length) {
    const triggersHtml = triggers.map((t, i) => {
      const state = getSelectState({
        testIds,
        testTriggers,
        triggerId: t.id,
      });

      return (
        <ListItem
          isDisabled={!testIds.length}
          key={t.id}
          noBorder={i === triggers.length - 1}
          onClick={() => handleClick(t.id)}
          onDelete={() => onDelete(t)}
          onEdit={() => onEdit(t)}
          selectState={state}
          trigger={t}
        />
      );
    });

    innerHtml = triggersHtml;
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
      <Header closeModal={closeModal} testCount={testIds.length} />
      <Divider />
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
