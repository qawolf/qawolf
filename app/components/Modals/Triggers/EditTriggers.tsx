import { TestTriggers, Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import ListItem from "./ListItem";

import Header from "../../shared-new/Modal/Header";
import { Box } from "grommet";
import { useUpdateTestTriggers } from "../../../hooks/mutations";

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
  const [updateTestTriggers] = useUpdateTestTriggers();

  const triggersHtml = triggers.map((t) => {
    const isSelected = testIds.some((testId) => {
      return (testTriggers[testId] || []).includes(t.id);
    });

    return <ListItem isSelected={isSelected} key={t.id} trigger={t} />;
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
